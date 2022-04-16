using Elecciones.Common.Models;
using System;
using System.Collections.Generic;

namespace Elecciones.Common.Responses
{
    public class PollResponse
    {
        public Guid IdPoll { get; set; }
        public string Poll { get; set; }
        public int NoQuestions { get; set; }
        public DateTime Validity { get; set; }
        public bool Reply { get; set; }
        public string BackgroundColor { get; set; }
        public string Icon { get; set; }
        public List<Question> Questions { get; set; }
    }
}
