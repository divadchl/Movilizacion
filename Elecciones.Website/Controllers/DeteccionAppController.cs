using Elecciones.Logic.Utilities;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Website.Models.Deteccion;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace Elecciones.Website.Controllers
{
    public class DeteccionAppController : Controller
    {
        public async Task<ActionResult> ResetPassword(string token)
        {
            using (DBDeteccionEntities db = new DBDeteccionEntities())
            {
                if (string.IsNullOrEmpty(token.Trim()))
                {
                    ViewBag.MessageError = "Error: ¡Token invalido!";
                    return View();
                }

                UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.token.Equals(token));
                if(user == null)
                {
                    ViewBag.MessageError = "Error: ¡Token invalido!";
                    return View();
                }
            }
            
            Models.Deteccion.ResetPassword model = new Models.Deteccion.ResetPassword
            {
                Token = token
            };
            return View(model);
        }

        [HttpPost]
        public async Task<ActionResult> ResetPassword(ResetPassword model)
        {
            if (ModelState.IsValid)
            {
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    var user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.token.Equals(model.Token));
                    
                    if (user != null)
                    {
                        string salt = Encrypt.CreateSalt();
                        string hash = Encrypt.GenerateHash(model.Password, salt);
                        user.salt = salt;
                        user.password = hash;
                        user.token = null;
                        await db.SaveChangesAsync();
                        ViewBag.Message = "Se restableció la contraseña satisfactoriamente.";
                        return View();
                    }
                    else
                    {
                        ViewBag.Message = "Error mientras se restablecia la contraseña.";
                        return View(model);
                    }
                }
            }
            ViewBag.Message = "Usuario no encontrado.";
            return View(model);
        }
    }
}