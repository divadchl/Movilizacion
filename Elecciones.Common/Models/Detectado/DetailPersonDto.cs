using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Detectado
{
    public class DetailPersonDto
    {
        public Guid IdPersona { get; set; }
        public string Nombre { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
        public string NombreCompleto => string.Concat(Nombre, " ", Paterno, " ", Materno);
        public string CredencialFrente { get; set; }
        public string CredencialAtras { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public List<AddressDto> Domicilios { get; set; }
        public List<GuestDto> Invitados { get; set; }
    }
}
