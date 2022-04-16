using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Logic.Business;
using Elecciones.Logic.Helpers;
using Elecciones.Logic.Movilizacion;
using Elecciones.Website.Helpers;
using Elecciones.Website.Models.Api;
using Elecciones.Website.Providers;
using Elecciones.Website.Results;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Users")]
    public class UsersController : ApiController
    {
        [HttpPost]
        [Authorize]
        [Route("GetUser")]
        public async Task<IHttpActionResult> GetUser([FromBody] UserNameRequest userNameRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var(user, process) = UsersHelper.GetUserASP(userNameRequest.UserName);
            if (user == null)
                return BadRequest("El usuario no está registrado.");

            UserMovResponse userMov = new UserMovResponse
            {
                Nombre = user.Nombre,
                Paterno = user.Paterno,
                Materno = user.Materno,
                Telefono = user.Telefono,
                Email = user.Email,
                UserName = user.UserName,
                Id = new Guid(user.Id),
                Process = new Common.Models.Process
                {
                    IdProcess = process.Id,
                    Name = process.Name,
                    Date = process.Date,
                    IdEncarte = process.IdEncarte,
                    Encarte = process.Encarte,
                    IsArchived = process.IsArchived,
                    IsLocal = process.IsLocal,
                    BeginDate = process.BeginDate,
                    IdState = process.IdEstado,
                    IdTerritory = process.Territories.FirstOrDefault().IdTerritorio,
                }
            };

            if (!userNameRequest.IsRegisteredDevice)
            {
                userMov.UpdateDevice = await new NotificationsMov().UpdateRegisterDevice(
                    userMov.Process.IdTerritory,
                    userMov.Process.IdProcess,
                    user.UserName,
                    userNameRequest.DeviceRegistration);
            }
            return Ok(userMov);
        }


        [HttpPost]
        [Authorize]
        [Route("ChangePassword")]
        public async Task<IHttpActionResult> ChangePassword([FromBody] ChangePasswordRequest changePasswordRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            ApplicationDbContext userContext = new ApplicationDbContext();
            UserManager<ApplicationUser> userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(userContext));
            ApplicationUser userASP = userManager.FindByName(changePasswordRequest.UserName);

            if (userASP == null)
                return NotFound();

            IdentityResult response = await userManager.ChangePasswordAsync(
                userASP.Id,
                changePasswordRequest.OldPassword,
                changePasswordRequest.NewPassword);

            if (!response.Succeeded)
                return BadRequest(response.Errors.FirstOrDefault());

            return Ok(new Response { IsSuccess = true });
        }

        [HttpPost]
        [Route("PasswordRecovery")]
        public async Task<IHttpActionResult> PasswordRecovery([FromBody] EmailRequest emailRequest)
        {
            try
            {
                ApplicationDbContext userContext = new ApplicationDbContext();
                UserManager<ApplicationUser> userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(userContext));
                ApplicationUser userASP = await userManager.FindByEmailAsync(emailRequest.Email);
                
                if (userASP == null)
                    return BadRequest("El usuario no se encuentra registrado");
                
                HttpRequest request = HttpContext.Current.Request;
                MailHelper mailHelper = new MailHelper();
                string link = $"{request.Url.Scheme}://{request.Url.Authority}/Account/ResetPassword";
                Response response = mailHelper.SendMail(emailRequest.Email, "Recuperar Contraseña", $"<h1>Recuperar Contraseña</h1>" +
                    $"Click en el siguiente enlace para cambiar su contraseña:<p>" +
                    $"<a href = \"{link}\">Cambiar Contraseña</a></p>");

                return Ok(new Response { IsSuccess = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            if (error != null)
            {
                return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            var userContext = new ApplicationDbContext();
            var userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(userContext));
            ApplicationUser user = await userManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
                externalLogin.ProviderKey));

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

                ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(userManager,
                   OAuthDefaults.AuthenticationType);
                ClaimsIdentity cookieIdentity = await user.GenerateUserIdentityAsync(userManager,
                    CookieAuthenticationDefaults.AuthenticationType);

                AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(user.UserName);
                Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
            }
            else
            {
                IEnumerable<Claim> claims = externalLogin.GetClaims();
                ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
                Authentication.SignIn(identity);
            }

            return Ok();
        }

        #region Helpers

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }
        #endregion

        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }

            public IList<Claim> GetClaims()
            {
                IList<Claim> claims = new List<Claim>();
                claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

                if (UserName != null)
                {
                    claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
                }

                return claims;
            }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
                    || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }
        }
    }
}