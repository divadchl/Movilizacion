using Acr.UserDialogs;
using Elecciones.Common.Helpers;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.Services;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Forms
{
    public class PasswordRecoveryViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private ApiService _apiService;
        private RegexHelper _regexHelper;
        private ICommand _recoverCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PasswordRecoveryViewModel()
        {
            _apiService = new ApiService();
            _regexHelper = new RegexHelper();
            IsEnabled = true;
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string Email { get; set; }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RecoverCommand => _recoverCommand ?? (_recoverCommand = new Command(RecoverAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void RecoverAsync()
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

            EmailRequest request = new EmailRequest { Email = Email };
            Response response = await _apiService.RecoveryPasswordAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRecoverPassword,
                request);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, TextStrings.InfoSendEmailChangePassword, TextStrings.Accept));
            await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(Email) || !_regexHelper.IsValidEmail(Email))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterValidEmail, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion[ Methods ]
    }
}
