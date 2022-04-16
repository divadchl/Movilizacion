using Elecciones.Common.Models.Detectado;
using System;

namespace Elecciones.Common.Models
{
    public class Person
    {
        public Guid IdPersona { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
        public string Nombre { get; set; }
        public string Calle { get; set; }
        public string NoExterior { get; set; }
        public string NoInterior { get; set; }
        public string Colonia { get; set; }
        public string CP { get; set; }
        public string Municipio { get; set; }
        public string Estado { get; set; }
        public string Longitud { get; set; }
        public string Latitud { get; set; }
        public ContactDto Contact { get; set; }
        public AddressDto Address { get; set; }
    }
}
