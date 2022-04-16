using System;

namespace Elecciones.Common.Models.News
{
    public class NewDto
    {
        public Guid IdNoticia { get; set; }
        public string Titulo { get; set; }
        public string Link { get; set; }
        public bool Activo { get; set; }
        public Guid IdEstado { get; set; }
        public string Estado { get; set; }
        public Guid IdMunicipio { get; set; }
        public string Municipio { get; set; }
        public Guid IdDistritoFederal { get; set; }
        public int? DistritoFederal { get; set; }
        public Guid IdDistritoLocal { get; set; }
        public int? DistritoLocal { get; set; }
        public DateTime? Date { get; set; }
        public string Territorio => string.Concat("E:" , Estado, "->", (Municipio != null? "M:"+ Municipio + "->": ""), (DistritoFederal != null ? "DF:" + DistritoFederal.ToString() + "->" : ""), (DistritoLocal != null ? "DL:" + DistritoLocal.ToString() + "->" : ""));
    }
}
