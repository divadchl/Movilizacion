using System;

namespace Elecciones.Common.Requests
{
    public class PersonVoteRequest : PersonRequest
    {
        public bool Vote { get; set; }
        public Guid IdProcess { get; set; }
    }
}
