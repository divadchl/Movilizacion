using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Deteccion.Views.Navigation.Lists;
using Deteccion.Views.Theme;
using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class LoginViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private string _password;
        private ICommand _loginCommand;
        private ICommand _registerCommand;
        private ICommand _forgotPasswordCommand;
        private ICommand _noticePrivacyCommand;
        private readonly ApiService _apiService;
        private readonly RegexHelper _regexHelper;
        #endregion [ Attributes ]

        #region [ Constructor ]

        public LoginViewModel()
        {
            IsEnabled = true;
            _apiService = new ApiService();
            _regexHelper = new RegexHelper();
#if DEBUG
            Email = TextStrings.Email;
            Password = TextStrings.Password;
#endif
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string Email { get; set; }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public string Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand LoginCommand => _loginCommand ?? (_loginCommand = new Command(LogingAsync));

        public ICommand RegisterCommand => _registerCommand ?? (_registerCommand = new Command(RegisterAsync));

        public ICommand ForgotPasswordCommand => _forgotPasswordCommand ?? (_forgotPasswordCommand = new Command(ForgotPasswordAsync));
        
        public ICommand NoticePrivacyCommand => _noticePrivacyCommand ?? (_noticePrivacyCommand = new Command(NoticePrivacyAsync));
        #endregion [ Commands ]

        #region [ Methods ]

        private async void LogingAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            DeviceRegistration deviceRegistration = null;
            if (Preferences.ContainsKey(TextStrings.KeyRegistrationDevice))
            {
                deviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, null));
            }
            
            LoginRequest request = new LoginRequest
            {
                Username = Email,
                Password = Password,
                IsRegisteredDevice = Preferences.Get(TextStrings.KeyIsRegisteredDevice , false),
                DeviceRegistration = deviceRegistration
            };

            Response response = await _apiService.LoginAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostLogin,
                request);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                Password = string.Empty;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
            
            Password = string.Empty;
            UserResponse user = (UserResponse)response.Result;
            Settings.User = JsonConvert.SerializeObject(user);
            IsEnabled = true;
            
            if (!(bool)user.IsRegister)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, TextStrings.InfoSendCredentials, TextStrings.Accept));
                await App.Current.MainPage.Navigation.PushAsync(new CredentialsCarouselPage());
            }
            else
            {
                Preferences.Set(TextStrings.KeyIsRegisteredDevice, user.IsRegisteredDevice);
                Settings.IsLogin = true;
                await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
            }
        }

        private async void RegisterAsync() => await App.Current.MainPage.Navigation.PushAsync(new SignUpPage());

        private async void ForgotPasswordAsync() => await App.Current.MainPage.Navigation.PushAsync(new PasswordRecoveryPage());

        private async void NoticePrivacyAsync() => await App.Current.MainPage.Navigation.PushAsync(new NoticePrivacyPage());

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(Email) || !_regexHelper.IsValidEmail(Email))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterValidEmail, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Password))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterPassword, TextStrings.Accept));
                return false;
            }

            return true;
        }

        #endregion [ Methods ]
    }
}
