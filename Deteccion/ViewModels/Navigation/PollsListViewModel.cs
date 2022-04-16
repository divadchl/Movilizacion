using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.ItemViewModels;
using Deteccion.Services;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Xamarin.Essentials;

namespace Deteccion.ViewModels.Navigation
{
    public class PollsListViewModel : ObservableObject
    {
        #region [ Attributes ]
        private ApiService _apiService;
        private ObservableCollection<PollItemViewModel> _polls;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PollsListViewModel()
        {
            instance = this;
            _apiService = new ApiService();
            LoadPollsAsync();
        }
        #endregion [ Constructor ]

        #region Singleton
        private static PollsListViewModel instance;

        public static PollsListViewModel GetInstance()
        {
            return instance;
        }

        #endregion

        #region [ Properties ]
        public ObservableCollection<PollItemViewModel> Polls
        {
            get => _polls;
            set => SetProperty(ref _polls, value);
        }
        #endregion [ Properties ]

        #region [ Methods ]
        public async void LoadPollsAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            PollsRequest polls = new PollsRequest 
            { 
                IdPerson = user.IdPerson,
                IdProcess = user.IdProcess
            };

            Response response = await _apiService.GetPollsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPolls,
                polls);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            List<Responses.PollResponse> listResponse = response.Result as List<Responses.PollResponse>;
            var list = listResponse.Select(x => new PollItemViewModel
            {
                IdPoll = x.IdPoll,
                Icon = x.Icon,
                BackgroundColor = x.BackgroundColor,
                NoQuestions = x.NoQuestions,
                Poll = x.Poll,
                Questions = x.Questions,
                Reply = x.Reply,
                Validity = x.Validity
            });
            Polls = new ObservableCollection<PollItemViewModel>(list);
        }
        #endregion [ Methods ]
    }
}
