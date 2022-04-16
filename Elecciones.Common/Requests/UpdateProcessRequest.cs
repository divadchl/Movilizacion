using Elecciones.Common.Models;
using System;

namespace Elecciones.Common.Requests
{
    public class UpdateProcessRequest : PersonRequest
    {
        public Guid? IdProcessNew { get; set; }
        public DeviceRegistration DeviceRegistration { get; set; }
    }
}
