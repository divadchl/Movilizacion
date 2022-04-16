using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class SignUpPasswordViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isVisible;
        private bool _isEnabled;
        private string _email;
        private string _phone;
        private ApiService _apiService;
        private PasswordRequest _password;
        private RegexHelper _regexHelper;
        private ICommand _continueCommand;
        private ICommand _resendSMSCommand;
        private ObservableCollection<GuestPerson> _guestPersons;
        private GuestPerson _guestPerson;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public SignUpPasswordViewModel(string email, string phone, List<GuestPerson> guestPersons)
        {
            _email = email;
            _phone = phone;
            _isEnabled = true;
            _apiService = new ApiService();
            _regexHelper = new RegexHelper();
            Password = new PasswordRequest();
            if(guestPersons.Count > 1)
            {
                IsVisible = true;
                GuestPersons = new ObservableCollection<GuestPerson>(guestPersons);
            }
            else if(guestPersons.Count == 1 || guestPersons.Count == 0)
            {
                GuestPersons = new ObservableCollection<GuestPerson>(guestPersons);
            }
        }
        #endregion [ Constructor ]

        #region [ Properties ]

        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public PasswordRequest Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        public GuestPerson GuestPerson 
        { 
            get => _guestPerson; 
            set => SetProperty(ref _guestPerson, value); 
        }

        public ObservableCollection<GuestPerson> GuestPersons 
        { 
            get => _guestPersons; 
            set => SetProperty(ref _guestPersons, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand ContinueCommand => _continueCommand ?? (_continueCommand = new Command(ContinueAsync));
        public ICommand ResendSMSCommand => _resendSMSCommand ?? (_resendSMSCommand = new Command(ResendSMSAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void ContinueAsync()
        {
            if (!await ValidateDataAsync())
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Requesting);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            if(!Preferences.ContainsKey(TextStrings.KeyCodeSMS))
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, TextStrings.WarningCodeSMS, TextStrings.Accept));
                return;
            }

            string code = Preferences.Get(TextStrings.KeyCodeSMS, string.Empty);

            if(code != Password.Code)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorCodeSMS, TextStrings.Accept));
                return;
            }

            if (GuestPersons.Count == 1)
            {
                if(GuestPersons[0].IdPerson == null)
                    Preferences.Set(TextStrings.KeyIdUserPater, GuestPersons[0].IdUser.ToString());
                else
                    Preferences.Set(TextStrings.KeyIdPater, GuestPersons[0].IdPerson.ToString());

                Preferences.Set(TextStrings.KeyIdProcess, GuestPersons[0].IdProcess.ToString());
                Preferences.Set(TextStrings.KeyNameProcess, GuestPersons[0].NameProcess);
            }
            else if (GuestPersons.Count > 1)
            {
                if (GuestPersons[0].IdPerson == null)
                    Preferences.Set(TextStrings.KeyIdUserPater, GuestPerson.IdUser.ToString());
                else
                    Preferences.Set(TextStrings.KeyIdPater, GuestPerson.IdPerson.ToString());

                Preferences.Set(TextStrings.KeyIdProcess, GuestPerson.IdProcess.ToString());
                Preferences.Set(TextStrings.KeyNameProcess, GuestPerson.NameProcess);
            }

            CodeRequest codeRequest = new CodeRequest
            {
                Email = _email,
                Password = Password.Password,
                Code = Password.Code,
            };

            Response response = await _apiService.RegisterPasswordAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRegisterPassword,
                codeRequest);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorRegisterPassword, TextStrings.Accept));
                return;
            }
            else
            {
                Preferences.Remove(TextStrings.KeyCodeSMS);
                await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoSavePassword, });
                await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
            }
        }

        private async void ResendSMSAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Requesting);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserRequest userRequest = new UserRequest { Phone = _phone };

            Response response = await _apiService.ResendSMSAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostResendSMS,
                userRequest);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorResendSMS, TextStrings.Accept));
                return;
            }

            RegisterResponse userResponse = (RegisterResponse)response.Result;
            string message = string.IsNullOrEmpty(userResponse.Message) 
                ? TextStrings.InfoResendMessage 
                : $"{userResponse.Message}\n{TextStrings.InfoResendMessage}";
            Preferences.Set(TextStrings.KeyCodeSMS, userResponse.Code.ToString());
            await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, message, TextStrings.Accept));
        }

        private async Task<bool> ValidateDataAsync()
        {
            if(GuestPersons.Count > 1)
            {
                if (GuestPerson == null)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorSelectPerson, TextStrings.Accept));
                    return false;
                }
            }
            
            if (string.IsNullOrEmpty(Password.Code))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCodeSMS, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Password.Password))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterPassword, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Password.ConfirmPassword))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterConfirmPassword, TextStrings.Accept));
                return false;
            }

            if (!Password.Password.Equals(Password.ConfirmPassword))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPaswordsNotSame, TextStrings.Accept));
                return false;
            }

            string message = string.Empty;
            if (!_regexHelper.ValidatePassword(Password.Password, out message))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, message, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
