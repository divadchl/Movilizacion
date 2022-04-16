using System;

namespace Elecciones.Common.Requests
{
    public class PersonContactedRequest : PersonRequest
    {
        public Guid IdProces { get; set; }
        public int IdTypeContact { get; set; }
        public string User { get; set; }
        public DateTime DateTime { get; set; }
    }
}
