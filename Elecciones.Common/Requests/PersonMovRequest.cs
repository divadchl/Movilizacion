using System;

namespace Elecciones.Common.Requests
{
    public class PersonMovRequest
    {
        public Guid IdProcess { get; set; }
        public string UserName { get; set; }
        public int IdState { get; set; }
    }
}
