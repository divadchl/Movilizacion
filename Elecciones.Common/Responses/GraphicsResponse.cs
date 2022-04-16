using System.Collections.Generic;

namespace Elecciones.Common.Responses
{
    public class GraphicsResponse
    {
        public int MaxValueTypeContact { get; set; }
        public int MaxValueVote { get; set; }
        public List<FlowEntryData> SeriesTypeContact { get; set; }
        public List<FlowEntryData> SeriesVote { get; set; }
    }
    public class FlowEntryData
    {
        public int Value { get; set; }
        public string Label { get; set; }
        public string Color { get; set; }
    }
}
