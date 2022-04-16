namespace Elecciones.Common.Models.Poll
{
    using System;
    using System.Collections.Generic;

    public class QuestionDto
    {
        public Guid Identifier { get; set; }
        public string Question { get; set; }
        public bool IsMultiple { get; set; }
        public bool IsOpen { get; set; }
        public bool IsIndividual { get; set; }
        public List<AnswerDto> AnswerList { get; set; }
        public int CantidadParticipantes { get; set; }
        public bool? Activo { get; set; }
        public Guid IdPregunta { get; set; }
        public List<string> OpenAnswers { get; set; }
        public int IdTipoPregunta { get; set; }
    }
}
