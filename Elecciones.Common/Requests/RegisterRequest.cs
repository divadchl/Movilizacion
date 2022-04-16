using System;

namespace Elecciones.Common.Requests
{
    public class RegisterRequest
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string CodeValidation { get; set; }
        public Guid IdProcess { get; set; }
    }
}
