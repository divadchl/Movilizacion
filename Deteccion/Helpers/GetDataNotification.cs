using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.ItemViewModels;
using Deteccion.Services;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Rg.Plugins.Popup.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.Essentials;

namespace Deteccion.Helpers
{
    public class GetDataNotification
    {
        ApiService _apiService;

        public GetDataNotification()
        {
            _apiService = new ApiService();
        }
        public async Task<NewsNotification> LoadNewsAsync(Guid idNewItem)
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return null;
            }

            GuidRequest id = new GuidRequest { Id = idNewItem };

            Response response = await _apiService.GetNewsItemAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetNewsItem,
                id);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
                return null;

            NewsNotification newsResponse = response.Result as NewsNotification;
            
            return newsResponse;
        }

        public async Task<Responses.PollResponse> LoadPollAsync(Guid idPoll)
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return null;
            }

            GuidRequest id = new GuidRequest { Id = idPoll };

            Response response = await _apiService.GetPollAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPoll,
                id);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
                return null;

            PollResponse pollResponse = response.Result as PollResponse;

            Responses.PollResponse poll = new Responses.PollResponse
            {
                Questions = pollResponse.Questions.Select(q => new Models.Question
                {
                    Answers = q.Answers.Select(a => new AnswerItemViewModel
                    {
                        IdAnswer = a.IdAnswer,
                        IdQuestion = a.IdQuestion,
                        Response = a.Response,
                        
                    }).ToList(),
                    IdQuestion = q.IdQuestion,
                    IdTypeQuestion = q.IdTypeQuestion,
                    Query = q.Query,
                }).ToList(),
                IdPoll = pollResponse.IdPoll,
                Poll = pollResponse.Poll,
                Reply = pollResponse.Reply,
                Validity = pollResponse.Validity
            };

            return poll;
        }
    }
}
