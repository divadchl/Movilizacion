using System;
using System.Collections.Generic;

namespace Elecciones.Common.Models.Detectado
{
    public class DetectadoDto
    {
        public Guid IdPersona { get; set; }
        public string Nombre { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
        public string INE { get; set; }
        public string Estado { get; set; }
        public string Municipio { get; set; }
        public string DistritoLocal { get; set; }
        public string DistritoFederal { get; set; }
        public string Seccion { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public string Calle { get; set; }
        public string Colonia { get; set; }
        public string CodigoPostal { get; set; }
        public string NoInterior { get; set; }
        public string NoExterior { get; set; }
        public IEnumerable<AddressDto> DomiciliosAdicionales { get; set; }
        public IEnumerable<ContactDto> Contactos { get; set; }
        public string Estatus { get; set; }
        public string Color { get; set; }
        public bool? Vigente { get; set; }
    }
}
