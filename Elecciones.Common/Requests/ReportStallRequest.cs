using System;

namespace Elecciones.Common.Requests
{
    public class ReportStallRequest
    {
        public int IdStall { get; set; }
        public Guid IdProcess { get; set; }
        public int IdStatusStall { get; set; }
        public DateTime DateTime { get; set; }
        public string Remark { get; set; }
        public string User { get; set; }
    }
}
