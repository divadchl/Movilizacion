using System;

namespace Elecciones.Common.Models
{
    public class AnswerUser
    {
        public Guid IdQuestion { get; set; }
        public Guid? IdAnswer { get; set; }
        public string OpenResponse { get; set; }
        public Guid IdPerson { get; set; }
    }
}
