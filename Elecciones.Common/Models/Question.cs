using System;
using System.Collections.Generic;

namespace Elecciones.Common.Models
{
    public class Question
    {
        public Guid IdQuestion { get; set; }
        public string Query { get; set; }
        public int IdTypeQuestion { get; set; }
        public List<Answer> Answers { get; set; }
    }
}
