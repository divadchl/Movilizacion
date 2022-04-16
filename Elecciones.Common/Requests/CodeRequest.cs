using System;

namespace Elecciones.Common.Requests
{
    public class CodeRequest
    {
        public string Email { get; set; }

        public string Password { get; set; }

        public string Code { get; set; }
    }
}
