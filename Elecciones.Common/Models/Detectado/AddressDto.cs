using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Detectado
{
    public class AddressDto
    {
        public Guid IdPersona { get; set; }
        public string Direccion { get; set; }
        public string NumeroInterior { get; set; }
        public string NumeroExterior { get; set; }
        public string Colonia { get; set; }
        public string CodigoPostal { get; set; }
        public string Estado { get; set; }
        public string Municipio { get; set; }
        public string DistritoLocal { get; set; }
        public string DistritoFederal { get; set; }
        public string Seccion { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public string DomicilioCompleto => string.Concat(Direccion, " ", NumeroExterior, " ", NumeroInterior, " ", Colonia, " ", Municipio, " ", Estado, " ", CodigoPostal);
    }
}
