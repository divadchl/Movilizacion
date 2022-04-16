namespace Elecciones.Common.Models.Poll
{
    using System;

    public class AnswerDto
    {
        public Guid Identifier { get; set; }
        public string Answer { get; set; }
        public bool? Activo { get; set; }
        public int CantidadParticipantes { get; set; }
        public Guid IdPregunta { get; set; }
    }
}
