using Elecciones.Common.Models;

namespace Elecciones.Common.Requests
{
    public class UserRequest : User
    {
        public string Phone { get; set; }

        public string CodeValidation { get; set; }
    }
}
