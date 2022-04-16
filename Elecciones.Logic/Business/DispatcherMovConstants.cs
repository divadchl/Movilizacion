namespace Elecciones.Logic.Business
{
    public static class DispatcherMovConstants
    {
        public static string[] SubscriptionTags { get; set; } = { "default" };
        public static string NotificationHubName { get; set; } = "movilizacion";
        public static string FullAccessConnectionString { get; set; } = "Endpoint=sb://mymovdec.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=LxnfNy2PL+OWz/q5Mu44Mz+PjBhZBxZv3atw/CpOubc=";
        
        //TODO eliminar
        //public static string FullAccessConnectionString { get; set; } = "Endpoint=sb://movilizacionnotifications.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=SVZMdCg+2boOnZqNW2dVUV8sm5ib6QBD+JhQqBViVQw=";
    }
}
