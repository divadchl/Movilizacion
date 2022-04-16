using Newtonsoft.Json;

namespace Elecciones.Common.Models
{
    public class NotificationPushiOS
    {
        [JsonProperty("aps")]
        public Aps Aps { get; set; }
    }

    public class Aps
    {
        [JsonProperty("alert")]
        public string Alert { get; set; }
        [JsonProperty("sound")]
        public string Sound { get; set; } = "default";
        [JsonProperty("parameters")]
        public Parameters Parameters { get; set; }
    }

    public class Parameters
    {
        [JsonProperty("title")]
        public string Title { get; set; }
        [JsonProperty("body")]
        public string Body { get; set; }
        [JsonProperty("tag")]
        public string Tag { get; set; }
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("value")]
        public string Value { get; set; } = string.Empty;
    }
}
