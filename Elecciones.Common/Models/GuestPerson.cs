using System;

namespace Elecciones.Common.Models
{
    public class GuestPerson
    {
        public Guid IdGuest { get; set; }
        public string NameGuest { get; set; }
        public string Phone { get; set; }
        public Guid? IdPerson { get; set; }
        public Guid? IdUser { get; set; }
        public string NamePerson { get; set; }
        public string CodeValidation { get; set; }
        public Guid? IdProcess { get; set; }
        public string NameProcess { get; set; }
    }
}
