using System;

namespace Elecciones.Common.Requests
{
    public class PersonsRequest
    {
        public Guid IdPersona { get; set; }
        public string Seccion { get; set; }
        public string Municipio { get; set; }
        public string DistritoLocal { get; set; }
        public string DistritoFederal { get; set; }
        public Guid IdProcess { get; set; }
        public string UserName { get; set; }
    }
}
