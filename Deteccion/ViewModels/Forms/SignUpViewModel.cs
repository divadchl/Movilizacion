using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Deteccion.Views.Forms;
using Elecciones.Common.Helpers;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Rg.Plugins.Popup.Services;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class SignUpViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private ApiService _apiService;
        private RegexHelper _regexHelper;
        private UserRequest _user;
        private ICommand _registerCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public SignUpViewModel()
        {
            _apiService = new ApiService();
            _user = new UserRequest();
            _regexHelper = new RegexHelper();
            _isEnabled = true;
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public UserRequest User
        {
            get => _user;
            set => SetProperty(ref _user, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RegisterCommand => _registerCommand ?? (_registerCommand = new Command(RegisterAsync));
        #endregion [ Commands ]

        #region [ Methods ]


        private async void RegisterAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Registering);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.RegisterUserAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRegisterUser,
                User);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (response.IsSuccess)
            {
                RegisterResponse registerResponse = (RegisterResponse)response.Result;
                Preferences.Set(TextStrings.KeyCodeSMS, registerResponse.Code.ToString());
                string message = string.IsNullOrEmpty(registerResponse.Message) 
                    ? TextStrings.InfoUserRegisterSendMessage 
                    : $"{registerResponse.Message}\n{TextStrings.InfoResendMessage}";
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, message, TextStrings.Accept));
                await App.Current.MainPage.Navigation.PushAsync(new SignUpPasswordPage(User.Email, User.Phone, registerResponse.GuestPersons));
                return;
            }
            else
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(User.Name))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterName, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(User.Email) || !_regexHelper.IsValidEmail(User.Email))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterValidEmail, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(User.Phone))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterPhone, TextStrings.Accept));
                return false;
            }

            if (!Regex.IsMatch(User.Phone, @"^\d+$"))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterValidPhone2, TextStrings.Accept));
                return false;
            }

            if (User.Phone.Length != 10)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterValidPhone, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(User.CodeValidation))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCodeValidation, TextStrings.Accept));
                return false;
            }

            if (!Regex.IsMatch(User.CodeValidation.ToUpper(), @"^([A-Z]{3}[0-9]{3}$)"))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCodeValidation2, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
