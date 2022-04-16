using System;

namespace Deteccion.Models
{
    public class Answer : ObservableObject
    {
        public Guid IdAnswer { get; set; }
        public string Response { get; set; }
        public Guid IdQuestion { get; set; }
    }
}
