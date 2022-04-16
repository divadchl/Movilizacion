using Acr.UserDialogs;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Xamarin.Essentials;

namespace Movilizacion.ViewModels.Navigation
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
            _apiService = new ApiService();
            LoadPollsAsync();
        }
        #endregion [ Constructor ]

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

            PersonMovRequest person = new PersonMovRequest
            {
                IdProcess = App.User.Process.IdProcess,
                UserName = App.User.UserName,
                IdState = App.User.Process.IdState
            };

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetPollsMovilizacionAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPollsMovilizacion,
                person,
                token.AccessToken);

            if (!response.IsSuccess)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            List<PollResponse> listResponse = response.Result as List<PollResponse>;
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
            UserDialogs.Instance.HideLoading();
        }
        #endregion [ Methods ]
    }
}
