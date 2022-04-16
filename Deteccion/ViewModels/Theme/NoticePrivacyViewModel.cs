using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Responses;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Theme
{
    public class NoticePrivacyViewModel : ObservableObject
    {
        #region [ Attributes ]
        private ApiService _apiService;
        private ICommand _acceptCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public NoticePrivacyViewModel()
        {
            _apiService = new ApiService();
            _ = LoadNoticePrivacyAsync();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        private string _noticePrivacy;

        public string NoticePrivacy
        {
            get => _noticePrivacy;
            set => SetProperty(ref _noticePrivacy, value);
        }

        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand AcceptCommand => _acceptCommand ?? (_acceptCommand = new Command(AcceptAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadNoticePrivacyAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.GetNoticePrivacyAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetNoticePrivacy);
            
            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            NoticePrivacy = response.Result.ToString();
        }

        private async void AcceptAsync() => await App.Current.MainPage.Navigation.PopAsync();

        #endregion [ Methods ]
    }
}
