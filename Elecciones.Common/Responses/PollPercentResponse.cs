using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Common.Responses
{
    public class PollPercentResponse
    {
        public Guid? IdEncuesta { get; set; }
        public string Encuesta { get; set; }
        public List<QuestionPercent> QuestionsPercent { get; set; }
    }

    public class QuestionPercent
    {
        public Guid IdPregunta { get; set; }
        public string Pregunta { get; set; }
        public int IdTipoPregunta { get; set; }
        public int? RespuestasTotal => AnswersPercent.Sum(x => x.TotalPorRespuestas);
        public List<AnswerUserPorcent> AnswersUserPorcent { get; set; } = new List<AnswerUserPorcent>();
        public List<AnswerPercent> AnswersPercent { get; set; } = new List<AnswerPercent>();

    }

    public class AnswerPercent
    {
        public Guid IdRespuesta { get; set; }
        public string Respuesta { get; set; }
        public int TotalPorRespuestas { get; set; }
        public double Porcentaje { get; set; }
        public List<AnswerUserPorcent> AnswersUserPorcent { get; set; }
    }

    public class AnswerUserPorcent
    {
        public Guid? IdRespuesta { get; set; }
        public Guid IdPregunta { get; set; }
        public string RespAbierta { get; set; }
    }
}
