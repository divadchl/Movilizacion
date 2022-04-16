using Elecciones.Common.Models;
using System.Collections.Generic;

namespace Elecciones.Common.Requests
{
    public class SendPollRequest
    {
        public List<AnswerUser> AnswersUser { get; set; }
    }
}
