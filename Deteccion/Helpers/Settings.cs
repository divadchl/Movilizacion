using Plugin.Settings;
using Plugin.Settings.Abstractions;

namespace Deteccion.Helpers
{
    public class Settings
    {
        private const string _user = "user";
        private const string _isLogin = "isLogin";
        private const string _imageProfile = "imageProfile";

        private static readonly string _stringDefault = string.Empty;
        private static readonly bool _boolDefault = false;

        private static ISettings AppSettings => CrossSettings.Current;

        public static string User
        {
            get => AppSettings.GetValueOrDefault(_user, _stringDefault);
            set => AppSettings.AddOrUpdateValue(_user, value);
        }

        public static bool IsLogin
        {
            get => AppSettings.GetValueOrDefault(_isLogin, _boolDefault);
            set => AppSettings.AddOrUpdateValue(_isLogin, value);
        }

        public static string ImageProfile
        {
            get => AppSettings.GetValueOrDefault(_imageProfile, _stringDefault);
            set => AppSettings.AddOrUpdateValue(_imageProfile, value);
        }
    }
}
