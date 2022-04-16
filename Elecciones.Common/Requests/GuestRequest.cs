using System;

namespace Elecciones.Common.Requests
{
    public class GuestRequest
    {
        public string Telefono { get; set; }
        public string Correo { get; set; }
        public string Nombre { get; set; }
        public Guid IdPersona { get; set; }
        public string CodigoInvitacion { get; set; }
        public Guid? IdProceso { get; set; }
        public string App { get; set; }
        public Guid? IdUser { get; set; }
    }
}
