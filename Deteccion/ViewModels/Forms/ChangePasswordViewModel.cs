using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Helpers;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class ChangePasswordViewModel : ObservableObject
    {
        #region [ Attributes ]
        private readonly ApiService _apiService;
        private RegexHelper _regexHelper;
        private bool _isEnabled;
        private ICommand _changePasswordCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ChangePasswordViewModel()
        {
            _apiService = new ApiService();
            _regexHelper = new RegexHelper();
            IsEnabled = true;
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string CurrentPassword { get; set; }

        public string NewPassword { get; set; }

        public string PasswordConfirm { get; set; }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand ChangePasswordCommand => _changePasswordCommand ?? (_changePasswordCommand = new Command(ChangePasswordAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void ChangePasswordAsync()
        {
            if (!await ValidateDataAsync())
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Changing);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                IsEnabled = true;
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            ChangePasswordRequest request = new ChangePasswordRequest
            {
                Email = user.Email,
                OldPassword = CurrentPassword,
                NewPassword = NewPassword,
            };

            Response response = await _apiService.ChangePasswordAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostChangePassword,
                request);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoChangePassword });
            Settings.IsLogin = false;
            Settings.User = string.Empty;
            await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(CurrentPassword))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCurrentPassword, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(NewPassword))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterNewPassword, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(PasswordConfirm))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterConfirmNewPassword, TextStrings.Accept));
                return false;
            }

            if (NewPassword != PasswordConfirm)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPasswordConfirmation, TextStrings.Accept));
                return false;
            }

            if (NewPassword?.Length < 8)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterLengthPassword, TextStrings.Accept));
                return false;
            }

            string message = string.Empty;
            if (!_regexHelper.ValidatePassword(NewPassword, out message))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, message, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
