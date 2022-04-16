using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Notifications
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; }
        public string Mensaje { get; set; }
        public string Aplicacion { get; set; }
        public string Territorio { get; set; }
        public bool Enviada { get; set; }
        public string Fecha { get; set; }
    }
}
