using Acr.UserDialogs;
using Elecciones.Common.Helpers;
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
    public class ChangePasswordViewModel : ObservableObject
    {
        #region [ Attributes ]
        private readonly ApiService _apiService;
        private RegexHelper _regexHelper;
        private ICommand _changePasswordCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ChangePasswordViewModel()
        {
            _apiService = new ApiService();
            _regexHelper = new RegexHelper();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string CurrentPassword { get; set; }

        public string NewPassword { get; set; }

        public string PasswordConfirm { get; set; }
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

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserMovResponse user = JsonConvert.DeserializeObject<UserMovResponse>(Preferences.Get(TextStrings.KeyUser, string.Empty));
            ChangePasswordRequest request = new ChangePasswordRequest
            {
                UserName = user.UserName,
                OldPassword = CurrentPassword,
                NewPassword = NewPassword,
            };

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.ChangePasswordAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostChangePassword,
                request,
                token.AccessToken);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                string errorMessage = response.Message.StartsWith(TextStrings.ErrorMessageOldPassword) ? TextStrings.ErrorOldPassword : response.Message;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, errorMessage, TextStrings.Accept));
                return;
            }

            await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoChangePassword });
            Preferences.Set(TextStrings.KeyIsLogin, false);
            Preferences.Remove(TextStrings.KeyUser);
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
