using Elecciones.Common.Models.Criteria;
using Elecciones.Logic;
using Elecciones.Logic.Security;
using Elecciones.Logic.Tools;
using Elecciones.Logic.Users;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Website.Models;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Xml.Linq;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class UsersController : Controller
    {
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

        // GET: Users
        [Authorize(Roles = "Usuarios")]
        public ActionResult Index()
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            ViewBag.GeneralInformation = $"Proceso: {proceso.Name}, Estado: {proceso.Estado}";
            ViewBag.CurrentProcessId = proceso.Id;
            ViewBag.CurrentStateId = proceso.IdEstado;
            return View();
        }


        [HttpPost]
        [Authorize(Roles = "Usuarios")]
        public JsonResult GetGeneralInformation()
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var generalInformation = $"Proceso: {proceso.Name}, Estado: {proceso.Estado}";
            return new JsonResult
            {
                Data = generalInformation,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios")]
        public JsonResult GetUsers()
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new UsersManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetUsers(User.GetHierarchy());

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Usuarios")]
        [HttpPost]
        public JsonResult GetGroups()
        {
            var groups = new HashSet<ApplicationGroup>();
            var hierarchy = User.GetHierarchy();
            var allGroups = GroupManager.Groups.Where(p => p.Hierarchy > hierarchy).OrderBy(g => g.Hierarchy).ToList();
            foreach (var group in allGroups)
            {
                groups.Add(group);
            }

            return new JsonResult
            {
                Data = groups.ToList(),
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Usuarios.Modificar")]
        [HttpPost]
        public JsonResult ExistsUser(string username)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new UsersManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.ExistsUser(username);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public async Task<JsonResult> NewUser(RegisterViewModel userViewModel, params string[] selectedGroups)
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
            if (createResult.Succeeded)
            {
                if (User.HasProcessId())
                    ProcesoManager.AddUsuarios(User.GetProcessId().Value, new string[] { user.UserName });
                if (selectedGroups != null)
                {
                    selectedGroups = selectedGroups ?? new string[] { };
                    await GroupManager.SetUserGroupsAsync(user.Id, selectedGroups);
                }

                EmailSender.Subject = "Nueva cuenta";
                EmailSender.EmailTo = new[] { user.Email };
                EmailSender.XslMessage = Server.MapPath("/Xslt/NewAccount.xslt");
                EmailSender.XmlMessage = new XElement("root",
                    new XElement("User", user.UserName),
                    new XElement("Pass", password)).ToString();
                EmailSender.Send();

            }



            return new JsonResult
            {
                Data = createResult.Succeeded,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };


            //if (selectedGroups != null)
            //{
            //    if (ModelState.IsValid)
            //    {



            //        //Add User to the selected Groups 
            //        if (createResult.Succeeded)
            //        {
            //            if (User.HasProcessId())
            //                ProcesoManager.AddUsuarios(User.GetProcessId().Value, new string[] { user.UserName });
            //            if (selectedGroups != null)
            //            {
            //                selectedGroups = selectedGroups ?? new string[] { };
            //                await GroupManager.SetUserGroupsAsync(user.Id, selectedGroups);
            //            }
            //            //var nClient = new Logic.NotificationClient.NotificationServiceClient();
            //            //var notification = new Logic.NotificationClient.Notification
            //            //{
            //            //    IdCampaign = 92,
            //            //    Subject = "Alta de usuario | PANEL",
            //            //    Content = new XElement("root",
            //            //            new XElement("Nombre", string.Format("{0} {1} {2}", user.Nombre, user.Paterno, user.Materno)),
            //            //            new XElement("User", user.UserName),
            //            //            new XElement("Pass", password)
            //            //        ).ToString(),
            //            //    Recipient = user.Email,
            //            //    DeliveryDate = DateTime.Now,
            //            //    IsPriority = true,
            //            //    UserName = User.Identity.Name,
            //            //    Type = Logic.NotificationClient.NotificationType.Email
            //            //};
            //            //var res = nClient.NewNotification(notification);
            //            //if (User.HasProcessId())
            //            //    return RedirectToAction("Usuarios", "Procesos", new { id = User.GetProcessId() });
            //            //else
            //            //    return RedirectToAction("Index", "Procesos", new { area = "" });
            //            return RedirectToAction("Territorios", "UsersAdmin", new { id = user.Id, area = "" });
            //        }
            //        foreach (var error in createResult.Errors)
            //            ModelState.AddModelError("", error);
            //    }
            //}
            //else
            //{
            //    ModelState.AddModelError("", "Debe elegir un perfil");
            //}
            //var groups = GetGroups();
            //ViewBag.GroupCount = groups.Count();
            //ViewBag.GroupsList = new SelectList(groups, "Id", "Description", groups);
            //return View(userViewModel);
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public async Task<JsonResult> EditUser(EditUserViewModel editUser)
        {
            bool updated = false;
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user != null)
                {
                    user.Email = editUser.Email;
                    user.Telefono = editUser.Telefono;
                    user.Paterno = editUser.Paterno;
                    user.Materno = editUser.Materno;
                    user.Nombre = editUser.Nombre;

                    await UserManager.UpdateAsync(user);
                    updated = true;
                }
            }

            return new JsonResult
            {
                Data = updated,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public async Task<JsonResult> ResetPasswordUser(string id)
        {
            bool changed = false;
            var user = await UserManager.FindByIdAsync(id);
            if (user != null)
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
                changed = passResult.Succeeded;

                EmailSender.Subject = "Nueva cuenta";
                EmailSender.EmailTo = new[] { user.Email };
                EmailSender.XslMessage = Server.MapPath("/Xslt/PasswordReset.xslt");
                EmailSender.XmlMessage = new XElement("root",
                    new XElement("User", user.UserName),
                    new XElement("Pass", password)).ToString();
                EmailSender.Send();

            }

            return new JsonResult
            {
                Data = changed,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public async Task<JsonResult> DeleteUser(string id)
        {
            var removed = false;
            var user = await UserManager.FindByIdAsync(id);
            if (user != null)
            {
                await GroupManager.ClearUserGroupsAsync(id);
                ProcesoManager.RemoveUsuario(user.UserName);

                var processId = User.GetProcessId().Value;
                var proceso = ProcesoManager.GetProcesoById(processId);
                var manager = new UsersManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
                manager.DeleteAllTerritory(user.UserName);

                var result = await UserManager.DeleteAsync(user);
                removed = result.Succeeded;
            }

            return new JsonResult
            {
                Data = removed,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public async Task<JsonResult> GetTerritorios(string id)
        {
            var user = await UserManager.FindByIdAsync(id);
            var territorios = User.HasProcessId() ? user.GetTerritoriosForProcess(User.GetProcessId().Value).ToList() : new List<TerritorioModel>();
            return new JsonResult
            {
                Data = territorios,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public JsonResult AddTerritorios(string userName, List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new UsersManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.AddTerritorio(userName, criteria);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Usuarios.Modificar")]
        public JsonResult DeleteTerritory(string username, int territoryId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new UsersManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.DeleteTerritory(username, territoryId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }


    }
}
