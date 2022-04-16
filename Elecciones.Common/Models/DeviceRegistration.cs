using System.Collections.Generic;

namespace Elecciones.Common.Models
{
    public class DeviceRegistration
    {
        public string RegistrationType { get; set; }
        public string RegistrationId { get; set; }
        public string RegistrationTemplateId { get; set; }
        public string PNSHandle { get; set; }
        public List<string> Tags { get; set; }
    }
}
