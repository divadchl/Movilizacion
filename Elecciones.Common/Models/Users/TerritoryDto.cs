using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Users
{
    public class TerritoryDto
    {
        public int IdTerritorio { get; set; }
        public int Id { get; set; }
        public TipoTerritorio Type { get; set; }
        public string Name { get; set; }
        public string FullName { get; set; }
        public string ShortName { get; set; }
    }

    public enum TipoTerritorio
    {
        Estado = 1,
        Municipio = 2,
        DistritoFederal = 3,
        DistritoLocal = 4,
        Seccion = 5,
        DistritoFederal_Municipio = 6,
    }
}
