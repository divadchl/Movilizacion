using System;

namespace Elecciones.Common.Models
{
    public class Process
    {
        public Guid IdProcess { get; set; }
        public string Name { get; set; }
        public DateTime? Date { get; set; }
        public int IdEncarte { get; set; }
        public string Encarte { get; set; }
        public bool IsArchived { get; set; }
        public bool IsLocal { get; set; }
        public DateTime BeginDate { get; set; }
        public int IdState { get; set; }
        public int IdTerritory { get; set; }
    }
}
