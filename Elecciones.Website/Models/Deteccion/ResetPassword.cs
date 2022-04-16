﻿using System.ComponentModel.DataAnnotations;

namespace Elecciones.Website.Models.Deteccion
{
    public class ResetPassword
    {
        [Required(ErrorMessage = "El campo {0} es obligatorio.")]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "El campo {0} debe contener entre {2} y {1} caracteres.")]
        [DataType(DataType.Password)]
        [Display(Name = "Contraseña")]
        public string Password { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio.")]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "El campo {0} debe contener entre {2} y {1} caracteres.")]
        [DataType(DataType.Password)]
        [Compare("Password")]
        [Display(Name = "Confirmar Contraseña")]
        public string ConfirmPassword { get; set; }

        public string Token { get; set; }
    }
}