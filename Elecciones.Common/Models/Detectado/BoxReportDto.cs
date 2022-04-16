using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Detectado
{
    public class BoxReportDto
    {
        public int IdCasilla { get; set; }
        public int IdEstatusCasilla { get; set; }
        public string EstatusCasilla { get; set; }
        public DateTime Fecha { get; set; }
        public string Comentario { get; set; }
        public string ColorEstatusCasilla { get; set; }
    }
}
