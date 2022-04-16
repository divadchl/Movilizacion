using Elecciones.Common.Models;
using System.Collections.Generic;

namespace Elecciones.Common.Responses
{
    public class RegisterResponse
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public List<GuestPerson> GuestPersons { get; set; }
    }
}
