using Elecciones.Common.Models.Detectado;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Common.Models
{
    public class Stall
    {
        public int IdStall { get; set; }
        public string StallType { get; set; }
        public string Address { get; set; }
        public string Reference { get; set; }
        public string Location { get; set; }
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public int IdTypeStall { get; set; }
        public string TypeStall { get; set; }
        public int IdFederalDistrict { get; set; }
        public int FederalDistrict { get; set; }
        public int IdState { get; set; }
        public string State { get; set; }
        public int IdMunicipality { get; set; }
        public string Municipality { get; set; }
        public int IdLocalDistrict { get; set; }
        public int LocalDistrict { get; set; }
        public int IdSection { get; set; }
        public int Section { get; set; }
        public List<BoxReportDto> ReportStalls { get; set; }
        public string StatusStall => ReportStalls.OrderByDescending(ss => ss.Fecha).Select(ss => ss.EstatusCasilla).FirstOrDefault() == null ? " ": ReportStalls.OrderByDescending(ss => ss.Fecha).Select(ss => ss.EstatusCasilla).FirstOrDefault();
        public int IdStatusStall => ReportStalls.OrderByDescending(ss => ss.Fecha).Select(ss => ss.IdEstatusCasilla).FirstOrDefault();
        public string Remarks => ReportStalls.OrderByDescending(ss => ss.Fecha).Select(ss => ss.Comentario).FirstOrDefault();
        private string _color;

        public string Color
        {
            get 
            {
                switch (IdStatusStall)
                {
                    case 1:
                        _color = "#1B943F";//verde
                        _icon = "\uF8EB";
                        break;
                    case 2:
                        _color = "#37ACDB";//azul
                        _icon = "\uF8EA";
                        break;
                    case 3:
                        _color = "#F2090E";//rojo
                        _icon = "\uF8ED";
                        break;
                }
                return _color; 
            }
        }

        private string _icon;
        public string Icon => _icon;
    }
}
