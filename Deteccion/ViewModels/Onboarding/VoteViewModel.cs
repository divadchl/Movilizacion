using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Onboarding
{
    public class VoteViewModel
    {
        #region [ Attributes ]
        private ApiService _apiService;
        private ICommand _closeCommand;
        private ICommand _voteCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public VoteViewModel()
        {
            _apiService = new ApiService();
        }
        #endregion [ Constructor ]

        #region [ Commands ]
        public ICommand CloseCommand => _closeCommand ?? (_closeCommand = new Command(async () => await CloseAsync()));
        public ICommand VoteCommand => _voteCommand ?? (_voteCommand = new Command(async () => await VoteAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task VoteAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Requesting);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);

            VoteRequest request = new VoteRequest
            {
                IdPerson = user.IdPerson,
                Vote = true
            };

            Response response = await _apiService.VoteResponseAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostVoteUser,
                request);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            if (Settings.IsLogin)
                await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
            else
                await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }

        private async Task CloseAsync()
        {
            if (Settings.IsLogin)
                await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
            else
                await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }
        #endregion
    }
}
