using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Users
{
    public class UserDto
    {
        public string Id { get; set; }    
        public string Nombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string NombreCompleto => string.Concat(Nombre, " " , ApellidoPaterno, " ", ApellidoMaterno);
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public string Username { get; set; }
        public string Perfil { get; set; }
    }

}
