namespace Elecciones.Logic.Business
{
    public static class DispatcherConstants
    {
        public static string[] SubscriptionTags { get; set; } = { "default" };
        public static string NotificationHubName { get; set; } = "deteccion";
        public static string FullAccessConnectionString { get; set; } = "Endpoint=sb://mydecmov.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=xjI7d2sNJdXWUpPSVYozNbFyJ4LLnPLli0p6+FDtCG8=";
    }
}
