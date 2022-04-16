using Deteccion.ItemViewModels;
using Elecciones.Common.Models;
using System;
using System.Collections.Generic;

namespace Deteccion.Models
{
    public class Question : ObservableObject
    {
        public Guid IdQuestion { get; set; }
        public string Query { get; set; }
        public int IdTypeQuestion { get; set; }
        public List<AnswerItemViewModel> Answers { get; set; }
        public AnswerUser AnswerUser { get; set; } = new AnswerUser();
    }
}
