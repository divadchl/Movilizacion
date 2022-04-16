using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.Helpers;
using Elecciones.Logic.Services;
using Elecciones.Logic.Utilities;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using static Elecciones.Logic.Services.SMSService;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/accountdeteccion")]
    public class AccountDeteccionController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();
        private int _code;

        [HttpPost]
        [ActionName("login")]
        public async Task<IHttpActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                UsersDeteccion user = db.UsersDeteccion.FirstOrDefault(x => x.email == loginRequest.Username);

                if (user == null)
                    return BadRequest("¡El usuario no está registrado!");

                string password = Encrypt.GenerateHash(loginRequest.Password, user.salt);
                user = await db.UsersDeteccion.FirstOrDefaultAsync(x => x.email == loginRequest.Username && x.password == password);
                if (user != null)
                {
                    UserResponse response = new UserResponse();
                    response.IdUser = user.id;
                    response.Name = user.name;
                    response.Email = user.email;
                    response.Phone = user.Telefono;
                    response.IsRegister = user.isRegister;
                    var person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdUsuario == user.id);
                    if (person != null)
                    {
                        if (!loginRequest.IsRegisteredDevice && user.isRegister == true)
                        {
                            if (loginRequest.DeviceRegistration != null)
                                response.IsRegisteredDevice = await new Notifications().UpdateRegisterDevice(
                                   int.Parse(person.Seccion),
                                   int.Parse(person.NoEstado),
                                   person.IdPersona,
                                   (Guid)person.IdProceso,
                                   loginRequest.DeviceRegistration);
                        }
                        else
                        {
                            response.IsRegisteredDevice = true;
                        }

                        response.IdPerson = person.IdPersona;
                        response.IdProcess = person.IdProceso;
                        response.NameProcess = await db.DATProceso
                            .Where(p => p.IdProceso == person.IdProceso)
                            .Select(x => x.Nombre)
                            .FirstOrDefaultAsync();
                        var images = await db.DATDoctoPersona.Where(d => d.IdPersona == person.IdPersona).ToListAsync();
                        if (images.Count > 0)
                        {
                            response.ImageFront = images[0].Documento;
                            response.ImageBack = images[1].Documento;
                        }
                    }
                    return Ok(response);
                }
                else
                {
                    return BadRequest("El correo o la contraseña son incorrectos");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("register")]
        public async Task<IHttpActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            DATInvitados codeValidation = await db.DATInvitados.FirstOrDefaultAsync(g => g.Telefono == registerRequest.Phone && g.CodigoInvitacion == registerRequest.CodeValidation);

            if (codeValidation == null)
                return BadRequest("El código de validación no está relacionado con su número telefónico, verifiquelo e inténtelo nuevamente");

            UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email == registerRequest.Email);
            if (user != null)
            {
                if (string.IsNullOrEmpty(user.password))
                {
                    SMSResponse resultCode = SendSMS(registerRequest.Phone);
#if DEBUG

#else
                    if (!resultCode.success)
                        return BadRequest("Error al generar el código de verificación, intentelo más tarde");
#endif

                    user.name = registerRequest.Name;
                    user.Telefono = registerRequest.Phone;
                    await db.SaveChangesAsync();

                    List<GuestPerson> guestPersons = new List<GuestPerson>();
                    if (codeValidation.IdPersona != null)
                    {
                        guestPersons = await (from g in db.DATInvitados
                                                  join pr in db.DATProceso on g.IdProceso equals pr.IdProceso 
                                                  join p in db.DATPersonas on g.IdPersona equals p.IdPersona
                                                  join ud in db.UsersDeteccion on p.IdUsuario equals ud.id
                                                  where g.Telefono == registerRequest.Phone && g.CodigoInvitacion == registerRequest.CodeValidation
                                                  select new GuestPerson
                                                  {
                                                      IdGuest = g.IdInvitado,
                                                      NameGuest = g.Nombre,
                                                      Phone = g.Telefono,
                                                      IdPerson = p.IdPersona,
                                                      //IdUser = p.ID,
                                                      NamePerson = ud.name,
                                                      CodeValidation = g.CodigoInvitacion,
                                                      IdProcess = g.IdProceso,
                                                      NameProcess = pr.Nombre
                                                  }).ToListAsync();
                    }

                    if(codeValidation.IdUser != null)
                    {
                        guestPersons = await (from g in db.DATInvitados
                                              join pr in db.DATProceso on g.IdProceso equals pr.IdProceso
                                              where g.Telefono == registerRequest.Phone && g.CodigoInvitacion == registerRequest.CodeValidation
                                              select new GuestPerson
                                              {
                                                  IdGuest = g.IdInvitado,
                                                  NameGuest = g.Nombre,
                                                  Phone = g.Telefono,
                                                  CodeValidation = g.CodigoInvitacion,
                                                  IdProcess = g.IdProceso,
                                                  IdUser = g.IdUser,
                                                  NameProcess = pr.Nombre
                                              }).ToListAsync();
                    }

                    RegisterResponse registerResponse = new RegisterResponse
                    {
                        Code = _code,
                        Message = "Ya tiene un registro previo.",
                        GuestPersons = guestPersons
                    };

                    return Ok(registerResponse);
                }
                else
                {
                    return BadRequest("¡Ya existe un usuario registrado con el mismo correo!");
                }
            }
            else
            {
                SMSResponse resultCode = SendSMS(registerRequest.Phone);
#if DEBUG

#else
                if (!resultCode.success)
                    return BadRequest("Error al generar el código de verificación, intentelo más tarde");
#endif
                UsersDeteccion usuario = new UsersDeteccion
                {
                    id = Guid.NewGuid(),
                    email = registerRequest.Email,
                    name = registerRequest.Name,
                    Telefono = registerRequest.Phone,
                    isRegister = false
                };

                db.UsersDeteccion.Add(usuario);
                await db.SaveChangesAsync();

                List<GuestPerson> guestPersons = new List<GuestPerson>();
                if (codeValidation.IdPersona != null)
                {
                    guestPersons = await (from g in db.DATInvitados
                                              join pr in db.DATProceso on g.IdProceso equals pr.IdProceso
                                              join p in db.DATPersonas on g.IdPersona equals p.IdPersona
                                              join ud in db.UsersDeteccion on p.IdUsuario equals ud.id
                                              where g.Telefono == registerRequest.Phone && g.CodigoInvitacion == registerRequest.CodeValidation
                                              select new GuestPerson
                                              {
                                                  IdGuest = g.IdInvitado,
                                                  NameGuest = g.Nombre,
                                                  Phone = g.Telefono,
                                                  IdPerson = p.IdPersona,
                                                  //IdUser = p.IdUsuario,
                                                  NamePerson = ud.name,
                                                  CodeValidation = g.CodigoInvitacion,
                                                  IdProcess = g.IdProceso,
                                                  NameProcess = pr.Nombre
                                              }).ToListAsync();
                }

                if (codeValidation.IdUser != null)
                {
                    guestPersons = await (from g in db.DATInvitados
                                          join pr in db.DATProceso on g.IdProceso equals pr.IdProceso
                                          where g.Telefono == registerRequest.Phone && g.CodigoInvitacion == registerRequest.CodeValidation
                                          select new GuestPerson
                                          {
                                              IdGuest = g.IdInvitado,
                                              NameGuest = g.Nombre,
                                              Phone = g.Telefono,
                                              CodeValidation = g.CodigoInvitacion,
                                              IdProcess = g.IdProceso,
                                              IdUser = g.IdUser,
                                              NameProcess = pr.Nombre
                                          }).ToListAsync();
                }

                RegisterResponse registerResponse = new RegisterResponse { Code = _code, GuestPersons = guestPersons };

                return Ok(registerResponse);
            }
        }

        [HttpPost]
        [Route("resendsms")]
        public IHttpActionResult ResendSMS([FromBody] UserRequest userRequest)
        {
            SMSResponse resultCode = SendSMS(userRequest.Phone);
#if DEBUG

#else
            if (!resultCode.success)
                return BadRequest("Error al generar el código de verificación, intentelo más tarde");
#endif
            return Ok(new RegisterResponse { Code = _code });
        }

        [HttpPost]
        [Route("registerpassword")]
        public async Task<IHttpActionResult> RegisterPassword([FromBody] CodeRequest codeRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            UsersDeteccion user = db.UsersDeteccion.FirstOrDefault(u => u.email == codeRequest.Email);
            if (user == null)
            {
                return BadRequest("No se encontró el usuario");
            }
            else
            {
                string salt = Encrypt.CreateSalt();
                string hash = Encrypt.GenerateHash(codeRequest.Password, salt);
                user.salt = salt;
                user.password = hash;
                await db.SaveChangesAsync();

                return Ok(new Response { IsSuccess = true });
            }
        }

        [HttpPost]
        [Route("changepassword")]
        public async Task<IHttpActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email.Equals(request.Email));
            if (user == null)
                return Ok(new Response
                {
                    IsSuccess = false,
                    Message = "Usuario no encontrado"
                });

            string password = Encrypt.GenerateHash(request.OldPassword, user.salt);
            user = await db.UsersDeteccion.FirstOrDefaultAsync(x => x.email == request.Email && x.password == password);

            if (user == null)
            {
                return Ok(new Response
                {
                    IsSuccess = false,
                    Message = "Contraseña incorrecta."
                });
            }

            string hash = Encrypt.GenerateHash(request.NewPassword, user.salt);

            user.password = hash;
            await db.SaveChangesAsync();

            return Ok(new Response
            {
                IsSuccess = true,
                Message = "El cambio de contraseña se realizó satisfactoriamente"
            });
        }

        [HttpPost]
        [Route("recoverpassword")]
        public async Task<IHttpActionResult> RecoverPassword([FromBody] EmailRequest emailRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email.Equals(emailRequest.Email));
                if (user == null)
                    return BadRequest("Usuario no encontrado");

                string token = Encrypt.GetSHA256(Guid.NewGuid().ToString());

                user.token = token;
                await db.SaveChangesAsync();

                HttpRequest request = HttpContext.Current.Request;
                MailHelper mailHelper = new MailHelper();
                string link = $"{request.Url.Scheme}://{request.Url.Authority}/DeteccionApp/ResetPassword?token={token}";
                Response response = mailHelper.SendMail(emailRequest.Email, "Recuperar Contraseña", $"<h1>Recuperar Contraseña</h1>" +
                    $"Click en el siguiente enlace para cambiar su contraseña:<p>" +
                    $"<a href = \"{link}\">Cambiar Contraseña</a></p>");

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("voteperson")]
        public async Task<IHttpActionResult> VotePerson([FromBody] VoteRequest voteRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                DATPersonas person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == voteRequest.IdPerson);
                if (person == null)
                    return BadRequest("Usuario no encontrado");

                DATProceso process = await db.DATProceso.FirstOrDefaultAsync(p => p.IdEstado == person.IdEstado);
                if (process == null)
                    return BadRequest("No se encontró el proceso");

                DATContacto contact = new DATContacto
                {
                    IdContacto = Guid.NewGuid(),
                    IdProceso = process.IdProceso,
                    IdPersona = voteRequest.IdPerson,
                    IdTipoContacto = (int)TypeContact.Voto,
                    Usuario = string.Empty,
                    FechaHora = DateTime.Now
                };

                db.DATContacto.Add(contact);
                await db.SaveChangesAsync();

                NotificationsService notificationsService = new NotificationsService();
                bool result = await notificationsService.UpdateTagAsync($"idPerson:{voteRequest.IdPerson}", "vote", true);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("getinvitations")]
        public async Task<IHttpActionResult> GetInvitations([FromBody] GuidRequest guidRequest)
        {
            try
            {
                UsersDeteccion userDeteccion = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.id == guidRequest.Id);

                if (userDeteccion == null)
                    return BadRequest("No se encontro el usuario");

                List<GuestPerson> guestPersons = new List<GuestPerson>();
                guestPersons = await (from g in db.DATInvitados
                                      join pr in db.DATProceso on g.IdProceso equals pr.IdProceso
                                      where g.Telefono == userDeteccion.Telefono && pr.Activo
                                      select new GuestPerson
                                      {
                                          IdGuest = g.IdInvitado,
                                          NameGuest = g.Nombre,
                                          Phone = g.Telefono,
                                          CodeValidation = g.CodigoInvitacion,
                                          IdProcess = g.IdProceso,
                                          IdUser = g.IdUser,
                                          NameProcess = pr.Nombre
                                      }).ToListAsync();

                return Ok(guestPersons);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("postexitprocess")]
        public async Task<IHttpActionResult> ExitProcess([FromBody] UpdateProcessRequest updateProcessRequest)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using (DBDeteccionEntities db = new DBDeteccionEntities())
            {
                using (DbContextTransaction transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        DATPersonas person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == updateProcessRequest.IdPerson);
                        
                        if (person == null) return BadRequest("¡El usuario no existe!");

                        if (person.IdProceso == new Guid())
                            return BadRequest("Actualmente no estas registrado en un proceso");

                        person.IdProceso = new Guid();
                        await db.SaveChangesAsync();

                        bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                                           int.Parse(person.Seccion),
                                           int.Parse(person.NoEstado),
                                           updateProcessRequest.IdPerson,
                                           (Guid)person.IdProceso,
                                           updateProcessRequest.DeviceRegistration);

                        if (!updateRegisterDevice)
                            throw new ArgumentException("El usuario no se puedo salir del proceso");

                        transaction.Commit();
                        return Ok(person.IdProceso);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return BadRequest(ex.Message);
                    }
                }
            }
        }

        [HttpPost]
        [Route("postupdateprocess")]
        public async Task<IHttpActionResult> UpdateProcess([FromBody] UpdateProcessRequest updateProcessRequest)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using (DBDeteccionEntities db = new DBDeteccionEntities())
            {
                using (DbContextTransaction transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        DATPersonas person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == updateProcessRequest.IdPerson);

                        if (person == null) return BadRequest("¡El usuario no se encuentra regitrado!");

                        if(!(updateProcessRequest.IdProcess == new Guid()))
                        {
                            DATProceso process = await db.DATProceso.FirstOrDefaultAsync(p => p.IdProceso == updateProcessRequest.IdProcess);
                            if (process.Activo)
                                return BadRequest($"Te encuentras registrado en el proceso {process.Nombre}. Para cambiarte de proceos es necesario que te des de baja del proceso, para eso ve a tu perfil y selecciona la opcion \"Salir del Proceso\"");
                        }
                        


                        DATProceso newProcess = await db.DATProceso.FirstOrDefaultAsync(p => p.IdProceso == updateProcessRequest.IdProcessNew);

                        if(newProcess == null)
                            return BadRequest("No existe el proceso al cual te invitaron");

                        person.IdProceso = newProcess.IdProceso;
                        await db.SaveChangesAsync();

                        bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                                           int.Parse(person.Seccion),
                                           int.Parse(person.NoEstado),
                                           updateProcessRequest.IdPerson,
                                           (Guid)updateProcessRequest.IdProcess,
                                           updateProcessRequest.DeviceRegistration);

                        if (!updateRegisterDevice)
                            throw new ArgumentException("No se puede actaulizar el proceso para el usuario");

                        transaction.Commit();
                        return Ok(new ProcessResponse { IdProcess = newProcess.IdProceso, NameProcess = newProcess.Nombre });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return BadRequest(ex.Message);
                    }
                }
            }
        }
        #region [ Helpers ]
        private SMSResponse SendSMS(string phone)
        {
            _code = new Random().Next(100000);
            string message = $"El código de verificación es: {_code}";
#if DEBUG
            Console.WriteLine(_code.ToString());
            return new SMSResponse();
#else
            return new SMSService().Send_SMS($"52{phone}", message);
#endif
        }
        #endregion [ Helpers ]
    }
}