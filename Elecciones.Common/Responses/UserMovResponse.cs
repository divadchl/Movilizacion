using Elecciones.Common.Models;
using System;

namespace Elecciones.Common.Responses
{
    public class UserMovResponse
    {
        public string Nombre { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string NombreCompleto => $"{Nombre} {Paterno} {Materno}";
        public Process Process { get; set; }
        public bool UpdateDevice { get; set; }
        public Guid Id { get; set; }
    }
}
