using Elecciones.Common.Models;

namespace Elecciones.Common.Requests
{
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsRegisteredDevice { get; set; }
        public DeviceRegistration DeviceRegistration { get; set; }
    }
}
