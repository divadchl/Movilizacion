using Elecciones.Common.Models;

namespace Elecciones.Common.Requests
{
    public class UserNameRequest
    {
        public string UserName { get; set; }
        public DeviceRegistration DeviceRegistration { get; set; }
        public bool IsRegisteredDevice { get; set; }
    }
}
