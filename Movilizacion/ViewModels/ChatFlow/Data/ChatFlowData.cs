using System;
using System.Collections.Generic;
using UXDivers.Grial;
namespace Movilizacion
{
    public class Detectados
    {
        public List<object> DATDoctoPersona { get; set; }
        public List<object> DATInvitados { get; set; }
        public string IdPersona { get; set; }
        public string Paterno { get; set; }
        public string Materno { get; set; }
        public string Nombre { get; set; }
        public string Calle { get; set; }
        public string NoExterior { get; set; }
        public string NoInterior { get; set; }
        public string Colonia { get; set; }
        public string CP { get; set; }
        public string Municipio { get; set; }
        public string Estado { get; set; }
        public string ClaveINE { get; set; }
        public string CURP { get; set; }
        public string NoEstado { get; set; }
        public string NoMunicipio { get; set; }
        public string Seccion { get; set; }
        public string Emision { get; set; }
        public string Vigencia { get; set; }
        public string OCR { get; set; }
        public string CIC { get; set; }
        public string NoEmision { get; set; }
        public string Usuario { get; set; }
        public DateTime FechaRegistro { get; set; }
        public object IdPadre { get; set; }
        public string  Telefono { get; set; }

    }

    public class FlowConversationData
    {
        public Detectados From { get; set; }
        public FlowMessageData[] Messages { get; set; }
        public FlowMessageData Preview { get; set; }
    }

    public class FlowMessageData
    {
        public string When { get; set; }
        public string Text { get; set; }
        public bool IsRead { get; set; }
        public bool IsIncoming { get; set; }
    }
}
