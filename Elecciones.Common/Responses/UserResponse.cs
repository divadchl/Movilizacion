using System;

namespace Elecciones.Common.Responses
{
    public class UserResponse
    {
        public Guid IdUser { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public byte[] ImageFront { get; set; }
        public byte[] ImageBack { get; set; }
        public bool? IsRegister { get; set; }
        public Guid IdPerson { get; set; }
        public bool IsRegisteredDevice { get; set; }
        public  Guid? IdProcess{ get; set; }
        public string NameProcess { get; set; }
    }
}
