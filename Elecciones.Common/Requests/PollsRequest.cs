using System;

namespace Elecciones.Common.Requests
{
    public class PollsRequest
    {
        public Guid IdPerson { get; set; }
        public Guid? IdProcess { get; set; }
    }
}
