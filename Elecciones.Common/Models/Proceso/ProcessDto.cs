using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Proceso
{
    public class ProcessDto
    {
        public Guid IdProceso { get; set; }
        public string Proceso { get; set; }
        public bool IsLocal { get; set; }
        public string FechaProceso { get; set; }
        public bool Activo { get; set; }
        public int IdEstado { get; set; }
        public string Estado { get; set; }
        public int IdEncarte { get; set; }
    }
}
