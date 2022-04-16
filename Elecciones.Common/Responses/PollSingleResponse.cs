using System;

namespace Elecciones.Common.Responses
{
    public class PollSingleResponse
    {
        public Guid IdPoll { get; set; }
        public string Poll { get; set; }
        public int NoQuestions { get; set; }
        public DateTime Validity { get; set; }
        public string BackgroundColor { get; set; }
        public string Icon { get; set; }
    }
}
