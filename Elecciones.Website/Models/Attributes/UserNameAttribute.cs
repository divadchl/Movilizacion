using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Elecciones.Website.Models
{
    public class UserNameAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var result = Regex.Match(value.ToString(), @"[a-zA-Z0-9_.-]+$");
            if (result.ToString() != value.ToString())
                return new ValidationResult("El nombre de usuario no puede contener espacios ni caracteres especiales.");
            return null;
        }
    }
}