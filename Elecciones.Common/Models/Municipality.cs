using System;

namespace Elecciones.Common.Models
{
    public class Municipality
    {
        public int IdMunicipio { get; set; }
        public decimal municipio { get; set; }
        public string descripcion { get; set; }
        public string abreviatura { get; set; }
        public Nullable<int> IdEstado { get; set; }
    }
}
