namespace Elecciones.Common.Requests
{
    public class PasswordRequest
    {
        public string Code { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
