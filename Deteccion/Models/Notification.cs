using Elecciones.Common.Helpers;
using SQLite;
using System;

namespace Deteccion.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }
        public string Icon { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DateNotification { get; set; }
        public string SerializeObject { get; set; }
        public int TypeNotification { get; set; }
        [Ignore]
        public string DateTimeAgo => FormatTime.TimeAgo(DateNotification);
    }
}
