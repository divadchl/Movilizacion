using Elecciones.Logic;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Website.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace Elecciones.Website.Controllers
{
    public class UsersAdminController : Controller
    {
        public UsersAdminController()
        {
        }

        public UsersAdminController(ApplicationUserManager userManager, ApplicationRoleManager roleManager)
        {
            UserManager = userManager;
            RoleManager = roleManager;
        }

        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        private ApplicationGroupManager _groupManager;
        public ApplicationGroupManager GroupManager
        {
            get
            {
                return _groupManager ?? new ApplicationGroupManager();
            }
            private set
            {
                _groupManager = value;
            }
        }

        private ApplicationRoleManager _roleManager;
        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ?? HttpContext.GetOwinContext()
                    .Get<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }

        public ActionResult Index()
        {
            ViewBag.hierarchy = User.GetHierarchy();
            return View();
        }

        public async Task<ActionResult> Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);

            // Show the groups the user belongs to:
            var userGroups = await GroupManager.GetUserGroupsAsync(id);
            ViewBag.GroupNames = userGroups.Select(u => u.Name).ToList();
            ViewBag.Territorios = User.HasProcessId() ? user.GetTerritoriosForProcess(User.GetProcessId().Value) : new List<TerritorioModel>();

            return View(user);
        }

        public async Task<ActionResult> Territorios(string id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", new { area = "" });

            var user = await UserManager.FindByIdAsync(id);

            ViewBag.Territorios = User.HasProcessId() ? user.GetTerritoriosForProcess(User.GetProcessId().Value) : new List<TerritorioModel>();
            ViewBag.UserName = user.UserName;
            ProcesoModel proceso = null;
            if (User.HasProcessId())
                proceso = ProcesoManager.GetProcesoById(User.GetProcessId().Value);
            ViewBag.NombreProceso = proceso.Name;
            return View(user);
        }

        [HttpPost]
        public ContentResult AddTerritorios(string userName, Territorio[] territorios)
        {

            var result = User.HasProcessId() ? TerritorioManager.SaveTerritorios(User.GetProcessId().Value, userName, territorios) : false;

            return Content(Newtonsoft.Json.JsonConvert.SerializeObject(result), "application/json");
        }

        [HttpGet]
        public ActionResult DeleteTerritorio(int? id, string userName)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            var territorio = TerritorioManager.GetTerritorio(id.Value);
            if (territorio == null)
            {
                return HttpNotFound();
            }
            ViewBag.UserName = userName;
            return View(territorio);
        }


        [HttpPost, ActionName("DeleteTerritorio")]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteTerritorioConfirmed(int id, string userName)
        {
            if (ModelState.IsValid)
            {

                var territorio = TerritorioManager.GetTerritorio(id);
                if (territorio == null)
                {
                    return HttpNotFound();
                }

                var result = TerritorioManager.Delete(territorio.IdTerritorio);
                if (!result)
                {
                    ModelState.AddModelError("", "error");
                    return View();
                }
                var user = await UserManager.FindByNameAsync(userName);

                return RedirectToAction("Territorios", "UsersAdmin", new { area = "", Id = user.Id });
            }
            return View();
        }

        [Authorize(Roles = "AdminUsuariosCrear")]
        public ActionResult AdminUser()
        {
            if (!User.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
                return new HttpStatusCodeResult(HttpStatusCode.Unauthorized);

            User.ClearProcessId();
            return RedirectToAction("Create", "UsersAdmin");
        }

        [Authorize(Roles = "AdminUsuariosCrear")]
        public ActionResult Create()
        {
            if (!User.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()) && !User.HasProcessId())
                return RedirectToAction("Index", "Procesos", new { area = "" });

            var groups = GetGroups();

            ViewBag.GroupCount = groups.Count();
            ViewBag.GroupsList = new SelectList(groups, "Id", "Description", groups);
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "AdminUsuariosCrear")]
        public async Task<ActionResult> Create(RegisterViewModel userViewModel, params string[] selectedGroups)
        {
            if (selectedGroups != null)
            {
                if (ModelState.IsValid)
                {
                    var user = new ApplicationUser
                    {
                        UserName = userViewModel.UserName,
                        Email = userViewModel.Email,
                        Telefono = userViewModel.Telefono,
                        Nombre = userViewModel.Nombre,
                        Paterno = userViewModel.Paterno,
                        Materno = userViewModel.Materno,
                        Parent = User.Identity.Name
                    };
                    var password = string.Empty;
                    var hasNumber = false;
                    while (!hasNumber)
                    {
                        password = Membership.GeneratePassword(10, 1);
                        hasNumber = System.Text.RegularExpressions.Regex.IsMatch(password, @"\d");
                    }

                    var createResult = await UserManager.CreateAsync(user, password);

                    //Add User to the selected Groups 
                    if (createResult.Succeeded)
                    {
                        if (User.HasProcessId())
                            ProcesoManager.AddUsuarios(User.GetProcessId().Value, new string[] { user.UserName });
                        if (selectedGroups != null)
                        {
                            selectedGroups = selectedGroups ?? new string[] { };
                            await GroupManager.SetUserGroupsAsync(user.Id, selectedGroups);
                        }
                        //var nClient = new Logic.NotificationClient.NotificationServiceClient();
                        //var notification = new Logic.NotificationClient.Notification
                        //{
                        //    IdCampaign = 92,
                        //    Subject = "Alta de usuario | PANEL",
                        //    Content = new XElement("root",
                        //            new XElement("Nombre", string.Format("{0} {1} {2}", user.Nombre, user.Paterno, user.Materno)),
                        //            new XElement("User", user.UserName),
                        //            new XElement("Pass", password)
                        //        ).ToString(),
                        //    Recipient = user.Email,
                        //    DeliveryDate = DateTime.Now,
                        //    IsPriority = true,
                        //    UserName = User.Identity.Name,
                        //    Type = Logic.NotificationClient.NotificationType.Email
                        //};
                        //var res = nClient.NewNotification(notification);
                        //if (User.HasProcessId())
                        //    return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
                        //else
                        //    return RedirectToAction("Index", "Procesos", new { area = "" });
                        return RedirectToAction("Territorios", "UsersAdmin", new { id = user.Id, area = "" });
                    }
                    foreach (var error in createResult.Errors)
                        ModelState.AddModelError("", error);
                }
            }
            else
            {
                ModelState.AddModelError("", "Debe elegir un perfil");
            }
            var groups = GetGroups();
            ViewBag.GroupCount = groups.Count();
            ViewBag.GroupsList = new SelectList(groups, "Id", "Description", groups);
            return View(userViewModel);
        }

        private List<ApplicationGroup> GetGroups()
        {
            var groups = new HashSet<ApplicationGroup>();

            var allGroups = GroupManager.Groups.ToList();

            if (User.IsInGroup("SuperAdmins"))
            {
                var superAdmin = allGroups.FirstOrDefault(p => p.Name == "SuperAdmins");
                if (superAdmin != null)
                    groups.Add(superAdmin);
            }
            return groups.ToList();
        }

        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var groups = GetGroups();

            var userGroups = await this.GroupManager.GetUserGroupsAsync(id);

            var model = new EditUserViewModel()
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Telefono = user.Telefono,
                Nombre = user.Nombre,
                Paterno = user.Paterno,
                Materno = user.Materno
            };

            foreach (var group in groups)
            {
                var listItem = new SelectListItem()
                {
                    Text = group.Description,
                    Value = group.Id,
                    Selected = userGroups.Any(g => g.Id == group.Id)
                };
                model.GroupsList.Add(listItem);
            }
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> Edit([Bind(Include = "Email,Telefono,Id,UserName,Paterno,Materno,Nombre")] EditUserViewModel editUser, params string[] selectedGroups)
        {
            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", null);

            if (selectedGroups == null)
            {
                ModelState.AddModelError("", "Debe elegir un perfil");
                return View();
            }

            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }

                // Update the User:
                user.Email = editUser.Email;
                user.Telefono = editUser.Telefono;
                user.Paterno = editUser.Paterno;
                user.Materno = editUser.Materno;
                user.Nombre = editUser.Nombre;

                await this.UserManager.UpdateAsync(user);

                // Update the Groups:
                selectedGroups = selectedGroups ?? new string[] { };
                await this.GroupManager.SetUserGroupsAsync(user.Id, selectedGroups);
                return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
            }
            ModelState.AddModelError("", "Something failed.");
            return View();
        }

        [Authorize(Roles = "AdminUsuariosEliminar")]
        public async Task<ActionResult> Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        [Authorize(Roles = "AdminUsuariosEliminar")]
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteConfirmed(string id)
        {
            if (!User.HasProcessId())
                return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });

            if (ModelState.IsValid)
            {
                if (id == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var user = await UserManager.FindByIdAsync(id);
                if (user == null)
                {
                    return HttpNotFound();
                }

                // Remove all the User Group references:
                await this.GroupManager.ClearUserGroupsAsync(id);
                ProcesoManager.RemoveUsuario(user.UserName);
                // Then Delete the User:
                var result = await UserManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    ModelState.AddModelError("", result.Errors.First());
                    return View();
                }
                return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
            }
            return View();
        }

        [Authorize(Roles = "AdminUsuariosCrear")]
        public async Task<ActionResult> Assign(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var allGroups = User.IsInGroup("SuperAdmin") ? GroupManager.Groups.ToList() : GroupManager.GetUserGroups(User.Identity.GetUserId());

            if (User.IsInGroup("admin"))
            {
                allGroups.Add(GroupManager.FindById("7f86ba54-5929-4fb6-81ca-2d95376359f4"));//corrdinador elecciones
                allGroups.Add(GroupManager.FindById("2ca31932-7c96-4696-a014-a5ca3c0a5bc1"));//capturista elecciones
            }
            else if (User.IsInGroup("CoordinadorElecciones"))//coordinador elecciones
            {
                allGroups.Add(GroupManager.FindById("2ca31932-7c96-4696-a014-a5ca3c0a5bc1"));//capturista elecciones
            }

            var userGroups = await this.GroupManager.GetUserGroupsAsync(id);

            var model = new EditUserViewModel()
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Telefono = user.Telefono,
                Nombre = user.Nombre,
                Paterno = user.Paterno,
                Materno = user.Materno
            };

            foreach (var group in allGroups)
            {
                var listItem = new SelectListItem()
                {
                    Text = group.Description,
                    Value = group.Id,
                    Selected = userGroups.Any(g => g.Id == group.Id)
                };
                model.GroupsList.Add(listItem);
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "AdminUsuariosCrear")]
        public async Task<ActionResult> Assign([Bind(Include = "Email,Telefono,Id,UserName,Paterno,Materno,Nombre")] EditUserViewModel editUser, params string[] selectedGroups)
        {
            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", null);
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }

                user.Email = editUser.Email;
                user.Telefono = editUser.Telefono;
                user.Paterno = editUser.Paterno;
                user.Materno = editUser.Materno;
                user.Nombre = editUser.Nombre;

                if (UserManager.Update(user).Succeeded)
                {
                    var code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                    var password = string.Empty;
                    var hasNumber = false;
                    while (!hasNumber)
                    {
                        password = Membership.GeneratePassword(10, 1);
                        hasNumber = System.Text.RegularExpressions.Regex.IsMatch(password, @"\d");
                    }


                    var passResult = await UserManager.ResetPasswordAsync(user.Id, code, password);
                    if (passResult.Succeeded)
                    {
                        selectedGroups = selectedGroups ?? new string[] { };
                        await this.GroupManager.SetUserGroupsAsync(user.Id, selectedGroups);

                        //var nClient = new Logic.NotificationClient.NotificationServiceClient();
                        //var notification = new Logic.NotificationClient.Notification
                        //{
                        //    IdCampaign = 92,
                        //    Subject = "Alta de usuario | PANEL",
                        //    Content = new XElement("root",
                        //        new XElement("Nombre", string.Format("{0} {1} {2}", user.Nombre, user.Paterno, user.Materno)),
                        //        new XElement("User", user.UserName),
                        //        new XElement("Pass", password)
                        //    ).ToString(),
                        //    Recipient = user.Email,
                        //    DeliveryDate = DateTime.Now,
                        //    IsPriority = true,
                        //    UserName = User.Identity.Name,
                        //    Type = Logic.NotificationClient.NotificationType.Email
                        //};
                        //var res = nClient.NewNotification(notification);
                    }
                    return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
                }

            }
            ModelState.AddModelError("", "Something failed.");
            return View();
        }

        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> ResetPassword(string id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var model = new ResetPasswordViewModel()
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Nombre = user.Nombre,
                Paterno = user.Paterno,
                Materno = user.Materno
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> ResetPassword([Bind(Include = "Email,Id,UserName,Paterno,Materno,Nombre")] ResetPasswordViewModel editUser)
        {
            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", null);

            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }
                user.Email = editUser.Email;
                if (UserManager.Update(user).Succeeded)
                {
                    var code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                    var password = string.Empty;
                    var hasNumber = false;
                    while (!hasNumber)
                    {
                        password = Membership.GeneratePassword(10, 1);
                        hasNumber = System.Text.RegularExpressions.Regex.IsMatch(password, @"\d");
                    }
                    var passResult = await UserManager.ResetPasswordAsync(user.Id, code, password);
                    if (passResult.Succeeded)
                    {
                        //var nClient = new Logic.NotificationClient.NotificationServiceClient();
                        //var notification = new Logic.NotificationClient.Notification
                        //{
                        //    IdCampaign = 93,
                        //    Subject = "Cambio de contraseña | PANEL",
                        //    Content = new XElement("root",
                        //        new XElement("Nombre", string.Format("{0} {1} {2}", user.Nombre, user.Paterno, user.Materno)),
                        //        new XElement("User", user.UserName),
                        //        new XElement("Pass", password)
                        //    ).ToString(),
                        //    Recipient = user.Email,
                        //    DeliveryDate = DateTime.Now,
                        //    IsPriority = true,
                        //    UserName = User.Identity.Name,
                        //    Type = Logic.NotificationClient.NotificationType.Email
                        //};
                        //var res = nClient.NewNotification(notification);
                    }
                    return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
                }
            }
            ModelState.AddModelError("", "Something failed.");
            return View(editUser);
        }

        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> DisableUser(string id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var model = new DisableUserViewModel()
            {
                Id = user.Id,
                UserName = user.UserName,
                IsDisabled = user.LockoutEndDateUtc != null
            };
            ViewBag.title = model.IsDisabled ? "Activar" : "Desactivar";
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "AdminUsuariosEditar")]
        public async Task<ActionResult> DisableUser([Bind(Include = "Id,IsDisabled")] DisableUserViewModel disableUser)
        {
            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", null);

            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(disableUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }
                var disable = !disableUser.IsDisabled;
                user.LockoutEndDateUtc = null;
                user.LockoutEnabled = false;
                if (disable)
                {
                    user.LockoutEnabled = true;
                    user.LockoutEndDateUtc = DateTime.Now.AddYears(100);
                }
                if (UserManager.Update(user).Succeeded)
                {
                    var code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                    var password = string.Empty;
                    var hasNumber = false;
                    while (!hasNumber)
                    {
                        password = Membership.GeneratePassword(10, 1);
                        hasNumber = System.Text.RegularExpressions.Regex.IsMatch(password, @"\d");
                    }
                    var passResult = await UserManager.ResetPasswordAsync(user.Id, code, password);
                    if (passResult.Succeeded)
                    {
                        //var nClient = new Logic.NotificationClient.NotificationServiceClient();
                        //var notification = new Logic.NotificationClient.Notification
                        //{
                        //    IdCampaign = 93,
                        //    Subject = "Cambio de contraseña | PANEL",
                        //    Content = new XElement("root",
                        //        new XElement("Nombre", string.Format("{0} {1} {2}", user.Nombre, user.Paterno, user.Materno)),
                        //        new XElement("User", user.UserName),
                        //        new XElement("Pass", password)
                        //    ).ToString(),
                        //    Recipient = user.Email,
                        //    DeliveryDate = DateTime.Now,
                        //    IsPriority = true,
                        //    UserName = User.Identity.Name,
                        //    Type = Logic.NotificationClient.NotificationType.Email
                        //};
                        //var res = nClient.NewNotification(notification);
                    }
                    return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
                }
            }
            ModelState.AddModelError("", "Something failed.");

            var u = await UserManager.FindByIdAsync(disableUser.Id);
            var model = new ResetPasswordViewModel()
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                Nombre = u.Nombre,
                Paterno = u.Paterno,
                Materno = u.Materno
            };

            return View(model);
        }


        [Authorize(Roles = "AdminUsuariosEliminarProceso")]
        public async Task<ActionResult> RemoveFromProcess(string id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            if (!User.HasProcessId())
                return RedirectToAction("Index", "Procesos", null);

            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        [Authorize(Roles = "AdminUsuariosEliminarProceso")]
        [HttpPost, ActionName("RemoveFromProcess")]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> RemoveFromProcessConfirmed(string id)
        {
            if (ModelState.IsValid)
            {
                if (id == null)
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

                if (!User.HasProcessId())
                    return RedirectToAction("Index", "Procesos", null);

                var user = await UserManager.FindByIdAsync(id);
                if (user == null)
                {
                    return HttpNotFound();
                }
                ProcesoManager.RemoveUsuario(User.GetProcessId().Value, user.UserName);
                return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
            }
            return View();
        }

        [Authorize(Roles = "AdminUsuariosProcesos")]
        public async Task<ActionResult> Procesos(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var userProcesos = ProcesoManager.GetProcesosForUser(user.UserName);

            var model = new EditUserViewModel()
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Telefono = user.Telefono,
                Nombre = user.Nombre,
                Paterno = user.Paterno,
                Materno = user.Materno
            };

            foreach (var proceso in ProcesoManager.GetProcesos())
            {
                var listItem = new SelectListItem()
                {
                    Text = proceso.Name,
                    Value = proceso.Id.ToString(),
                    Selected = userProcesos.Any(g => g.Id == proceso.Id)
                };
                model.GroupsList.Add(listItem);
            }
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "AdminUsuariosProcesos")]
        public async Task<ActionResult> Procesos([Bind(Include = "Email,Telefono,Id,UserName,Paterno,Materno,Nombre")] EditUserViewModel editUser, params string[] selectedProcesos)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }
                // Update the Groups:
                selectedProcesos = selectedProcesos ?? new string[] { };
                ProcesoManager.SetProcesos(user.UserName, selectedProcesos);
                return RedirectToAction("Index", "UsersAdmin", new { id = User.GetProcessId() });
            }
            ModelState.AddModelError("", "Something failed.");
            return View();
        }
    }
}