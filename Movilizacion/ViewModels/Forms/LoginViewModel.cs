using Acr.UserDialogs;
using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.Services;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Forms
{
    public class LoginViewModel : ObservableObject
    {
        #region [ Attributes ]
        private string _password;
        private ICommand _loginCommand;
        private ICommand _forgotPasswordCommand;
        private readonly ApiService _apiService;
        #endregion [ Attributes ]

        #region [ Constructor ]

        public LoginViewModel()
        {
            _apiService = new ApiService();
            //TODO Eliminar
#if DEBUG
            UserName = TextStrings.Email;
            Password = TextStrings.Password; 
#endif
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string UserName { get; set; }

        public string Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand LoginCommand => _loginCommand ?? (_loginCommand = new Command(LogingAsync));
        
        public ICommand ForgotPasswordCommand => _forgotPasswordCommand ?? (_forgotPasswordCommand = new Command(ForgotPasswordAsync));
        #endregion [ Commands ]

        #region [ Methods ]

        private async void LogingAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            var (token, errorMessage) = await _apiService.GetToken(
                Constants.URL_BASE,
                UserName,
                Password);

            if (token == null)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, errorMessage, TextStrings.Accept));
                return;
            }
            else if (token == null || string.IsNullOrEmpty(token.AccessToken))
            {
                UserDialogs.Instance.HideLoading();
                errorMessage = token.ErrorDescription.Equals(TextStrings.ErrorLogin2) ? TextStrings.ErrorLogin : token.ErrorDescription;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, errorMessage, TextStrings.Accept));
                return;
            }
            
            Preferences.Set(TextStrings.KeyToken, JsonConvert.SerializeObject(token));
            UserNameRequest request = null;
            //var Device = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, string.Empty));
            
            if (Preferences.ContainsKey(TextStrings.KeyIsRegisteredDevice))
                request = new UserNameRequest
                {
                    UserName = UserName,
                    DeviceRegistration = null,
                    IsRegisteredDevice = true,
                };
            else
                request = new UserNameRequest
                {
#if DEBUG
                    UserName = UserName,
                    //DeviceRegistration = null,
                    //IsRegisteredDevice = true,
                    DeviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, string.Empty)),
                    IsRegisteredDevice = false,
#else
                    UserName = UserName,
                    DeviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, string.Empty)),
                    IsRegisteredDevice = false,
#endif
                };

            Response response = await _apiService.LoginAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostLogin,
                request,
                token.AccessToken);
            
            UserDialogs.Instance.HideLoading();
            if (!response.IsSuccess)
            {
                Password = string.Empty;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
            
            Password = string.Empty;
            UserMovResponse user = (UserMovResponse)response.Result;
            App.User = user;
            Preferences.Set(TextStrings.KeyUser, JsonConvert.SerializeObject(user));
            Preferences.Set(TextStrings.KeyIsLogin, true);
            if (user.UpdateDevice)
                Preferences.Set(TextStrings.KeyIsRegisteredDevice, true);
            
            await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        }

        private async void ForgotPasswordAsync() => await App.Current.MainPage.Navigation.PushAsync(new PasswordRecoveryPage());

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(UserName))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterUserName, TextStrings.Accept));
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
