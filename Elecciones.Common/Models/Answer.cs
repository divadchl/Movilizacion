using System;

namespace Elecciones.Common.Models
{
    public class Answer
    {
        public Guid IdAnswer { get; set; }
        public string Response { get; set; }
        public Guid IdQuestion { get; set; }
    }
}
