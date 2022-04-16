using System;

namespace Elecciones.Common.Requests
{
    public class VoteRequest
    {
        public Guid IdPerson { get; set; }
        public bool Vote { get; set; }
    }
}
