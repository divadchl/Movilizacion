using Newtonsoft.Json;
using System;

namespace Elecciones.Common.Models
{
    public class NotificationPush
    {
        [JsonProperty(PropertyName = "notification")]
        public Notification Notification { get; set; } = new Notification();
        [JsonProperty(PropertyName = "data")]
        public Data Data { get; set; } = new Data();
    }

    public class Notification
    {
        [JsonProperty(PropertyName="title")]
        public string Title { get; set; }
        [JsonProperty(PropertyName = "body")]
        public string Body { get; set; }
        [JsonProperty(PropertyName = "tag")]
        public string Tag { get; set; }
    }

    public class Data
    {
        [JsonProperty(PropertyName = "id")]
        public Guid Id { get; set; }
        [JsonProperty(PropertyName = "value")]
        public string Value { get; set; } = string.Empty;
    }
}
