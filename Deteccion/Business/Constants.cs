namespace Deteccion.Business
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

        public class Path
        {
            public static string PathNoImage => URL_BASE + "/images/noimage.png";
        }

        public class EndPoints
        {
            public static string PostLogin = "/AccountDeteccion/login";
            public static string PostRecoverPassword = "/AccountDeteccion/RecoverPassword";
            public static string PostRegisterUser = "/AccountDeteccion/Register";
            public static string PostRegisterPassword = "/AccountDeteccion/registerpassword";
            public static string PostResendSMS = "/AccountDeteccion/resendsms";
            public static string PostChangePassword = "/AccountDeteccion/changepassword";
            public static string PostVoteUser = "/AccountDeteccion/voteperson";
            public static string PostGetInvitations = "/AccountDeteccion/getinvitations";
            
            public static string PostRecognizerCredential = "/credentials/recognizercredential";
            public static string PostSaveCredentialTypeC = "/credentials/savecredentialstypec";
            public static string PostSaveCredentialTypeDEF = "/credentials/savecredentialstypedef";
            public static string PostSaveCredentialTypeGH = "/credentials/savecredentialstypegh";
            public static string PostChangeRecognizerCredential = "/credentials/changerecognizercredential";

            public static string PostSaveCredentialFront = "/credentials/savecredentialfront";
            public static string PostSaveCredentialBack = "/credentials/savecredentialback";

            public static string PostRegisterAddress = "/credentials/registeraddress";
            public static string PostRegisterAddressINE = "/credentials/registeraddressINE";
            public static string PostResendCIC = "/credentials/resendcic";

            public static string PostRegisterGuest = "/guests/registerguest";
            public static string PostGetGuestNotConfirm = "/guests/getguestsnotconfirm";
            public static string PostGetGuestConfirm = "/guests/getguestsconfirm";

            public static string PostGetPolls = "/polls/getpolls";
            public static string PostGetPoll = "/polls/getpoll";
            public static string PostSendPoll = "/polls/sendpoll";

            public static string GetNews = "/news/getnews";
            public static string GetNewsItem = "/news/getnewsitem";

            public static string GetStates = "/states";
            public static string GetMunicipalities = "/states/getmunicipalities?idEstado=";
            
            public static string GetNoticePrivacy = "/noticeprivacy/getnoticeprivacy";

            public static string PostExitProcess = "/AccountDeteccion/postexitprocess";
            public static string PostUpdateProcess = "/AccountDeteccion/postupdateprocess";

        }
    }
}
