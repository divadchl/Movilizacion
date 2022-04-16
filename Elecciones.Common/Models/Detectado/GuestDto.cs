using System;

namespace Elecciones.Common.Models.Detectado
{
    public class GuestDto
    {
        public Guid GuestId { get; set; }
        public string Name { get; set; }
        public string RegisteredImage { get; set; }
        public string Location { get; set; }
        public bool IsRegistered { get; set; }
    }
}
