using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Detectado
{
    public class BoxDto
    {
        public int IdCasilla { get; set; }
        public string Casilla { get; set; }
        public string Domicilio { get; set; }
        public string Ubicacion { get; set; }
        public string Referencia { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public int IdTipoCasilla { get; set; }
        public string TipoCasilla { get; set; }
        public int IdDistritoFederal { get; set; }
        public int DistritoFederal { get; set; }
        public int IdEstado { get; set; }
        public string Estado { get; set; }
        public int IdMunicipio { get; set; }
        public string Municipio { get; set; }
        public int IdDistritoLocal { get; set; }
        public int DistritoLocal { get; set; }
        public int IdSeccion { get; set; }
        public int Seccion { get; set; }
        public List<BoxReportDto> ReporteCasilla { get; set; }
    }
}
