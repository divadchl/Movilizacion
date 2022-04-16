using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Elecciones.Website.Models
{
    public class UsuarioModel
    {

        [Display(Name = "Nombre Completo")]
        public string FullName { get { return string.Format("{0} {1} {2}", Nombre, Paterno, Materno); } }
        public string Id { get { return _id; } }
        [Display(Name = "Usuario")]
        public string UserName { get { return _userName; } }
        public string Nombre { get { return _nombre; } }
        public string Paterno { get { return _paterno; } }
        public string Materno { get { return _materno; } }
        public string Email { get { return _email; } }
        [Display(Name = "Teléfono")]
        public string Telefono { get { return _telefono; } }
        [Display(Name = "Perfiles")]
        public List<ApplicationGroup> Groups { get { return _groups; } }
        public string Group
        {
            get
            {
                return string.Join(",", _groups.Select(p => p.LongName));
            }
        }
        public int Hierarchy { get { return _hierarchy; } }
        public bool LockedOut { get { return _lockedOut; } }

        private ApplicationUserManager _userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
        private ApplicationGroupManager _groupManager = new ApplicationGroupManager();
        private string _id, _userName, _nombre, _paterno, _materno, _email, _telefono;
        private bool _lockedOut;
        private int _hierarchy;
        private List<ApplicationGroup> _groups;
        public UsuarioModel(Guid userId)
        {
            var user = _userManager.FindByIdAsync(userId.ToString()).Result;
            Init(user);
        }

        public UsuarioModel(string userName)
        {
            var user = _userManager.FindByNameAsync(userName).Result;
            Init(user);
        }

        public void Init(ApplicationUser user)
        {
            _id = user.Id;
            _userName = user.UserName;
            _nombre = user.Nombre;
            _paterno = user.Paterno;
            _materno = user.Materno;
            _email = user.Email;
            _telefono = user.Telefono;
            _lockedOut = user.LockoutEndDateUtc != null;

            _groups = _groupManager.GetUserGroups(user.Id);
            var _group = _groups.FirstOrDefault();
            _hierarchy = _group.Hierarchy;
        }
    }
}