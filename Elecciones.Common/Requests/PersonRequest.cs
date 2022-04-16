using System;

namespace Elecciones.Common.Requests
{
    public class PersonRequest
    {
        public Guid IdPerson { get; set; }
        public Guid? IdProcess { get; set; }
    }
}
