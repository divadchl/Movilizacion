namespace Movilizacion.Business
{
    public class Constants
    {
#if DEBUG
        public static string URL_BASE => "https://elecciones-website.conveyor.cloud";
        //public static string URL_BASE => "http://192.168.100.17:45455";
        //public static string URL_BASE => "https://www.mydecmov.com";
#else
        public static string URL_BASE => "https://www.mydecmov.com";
#endif
        public static string SERVICE_PREFIX => "/api";

        public static string TOKENTYPE => "bearer";

        public class EndPoints
        {
            public static string PostLogin = "/users/getuser";
            public static string PostRecoverPassword = "/users/passwordrecovery";
            public static string PostChangePassword = "/users/changepassword";
            
            public static string PostVotePerson = "/persons/postvoteperson";
            public static string PostContactedPerson = "/persons/postcontactedperson";
            
            public static string PostGetPersons = "/persons/getpersons";
            public static string PostGetStalls = "/persons/getstalls";
            public static string PostGetPerson = "/persons/getperson";
            public static string PostGetGraphics = "/persons/postgetgraphics";
            public static string GetActions = "/persons/getactions";
            public static string GetStatusStall = "/persons/getstatusstall";
            public static string PostReportStall = "/persons/postreportstall";

            public static string PostGetPollsMovilizacion = "/polls/getpollsmovilizacion";
            public static string GetPollAnswered = "/polls/pollanswered?idEncuesta=";

            public static string GetNews = "/news/getnewsmovilizacion";

            public static string PostRegisterGuest = "/guests/registerguestmymov";
            public static string PostGetGuestNotConfirm = "/guests/getguestsnotconfirmmymov";
            public static string PostGetGuestConfirm = "/guests/getguestsconfirmmymov";
        }
    }
}
