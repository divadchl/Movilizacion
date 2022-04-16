using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Elecciones.Website.Models
{
    public class RoleViewModel
    {
        public string Id { get; set; }
        [Required(AllowEmptyStrings = false)]
        [Display(Name = "Nombre")]
        public string Name { get; set; }
    }
    public class DisableUserViewModel
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public bool IsDisabled { get; set; }
    }
    public class ResetPasswordViewModel
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        [Required]
        public string Email { get; set; }
        public string Nombre { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
    }
    public class EditUserViewModel
    {
        public EditUserViewModel()
        {
            this.RolesList = new List<SelectListItem>();
            this.GroupsList = new List<SelectListItem>();
        }
        [Display(Name = "Usuario")]
        public string UserName { get; set; }
        public string Id { get; set; }
        [Required(AllowEmptyStrings = false)]
        [Display(Name = "Email")]
        //[EmailAddress]
        public string Email { get; set; }
        [Required]
        [MaxLength(10)]
        [Display(Name = "Teléfono Móvil")]
        [Phone]
        public string Telefono { get; set; }
        [Required]
        public string Nombre { get; set; }
        [Required]
        public string Paterno { get; set; }
        [Required]
        public string Materno { get; set; }
        public string Password { get; set; }

        // We will still use this, so leave it here:
        public ICollection<SelectListItem> RolesList { get; set; }

        // Add a GroupsList Property:
        public ICollection<SelectListItem> GroupsList { get; set; }
    }
    public class GroupViewModel
    {
        public GroupViewModel()
        {
            this.UsersList = new List<SelectListItem>();
            this.RolesList = new List<SelectListItem>();
        }
        [Required(AllowEmptyStrings = false)]
        public string Id { get; set; }
        [Required(AllowEmptyStrings = false)]
        [Display(Name = "Nombre corto")]
        public string Name { get; set; }
        [Display(Name = "Descripción")]
        public string Description { get; set; }
        [Display(Name = "Nombre")]
        public string LongName { get; set; }
        public string Parent { get; set; }
        [Display(Name = "Nivel")]
        public int Hierarchy { get; set; }
        public ICollection<SelectListItem> UsersList { get; set; }
        public ICollection<SelectListItem> RolesList { get; set; }
    }
}