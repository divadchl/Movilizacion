using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Responses;
using System;

namespace Elecciones.Common.Requests
{
    public class CredentialRequest
    {
        public Guid IdPersona { get; set; }

        public byte[] ImageFront { get; set; }
        
        public byte[] ImageBack { get; set; }

        public Guid? IdPater { get; set; }
        public Guid? IdUserPater { get; set; }

        public TypeCredential TypeCredential { get; set; }
        public DeviceRegistration DeviceRegistration { get; set; }
        public UserResponse User { get; set; }
        public int State { get; set; }
        public Guid IdProcess { get; set; }
    }
}
