using Acr.UserDialogs;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.Essentials;

namespace Movilizacion.ViewModels.Navigation
{
    public class PollListItemViewModel : ObservableObject
    {
        #region [ Attributes ]
        private int _respuestasTotales;
        private ApiService _apiService;
        private PollResponse _poll;
        private ObservableCollection<PollPercentItemViewModel> _questions;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PollListItemViewModel(PollResponse poll)
        {
            _apiService = new ApiService();
            Poll = poll;
            _ = LoadPoll();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public int RespuestasTotales
        {
            get => _respuestasTotales;
            set => SetProperty(ref _respuestasTotales, value);
        }

        public PollResponse Poll 
        { 
            get => _poll; 
            set => SetProperty(ref _poll, value); 
        }

        public ObservableCollection<PollPercentItemViewModel> Questions
        {
            get => _questions;
            set => SetProperty(ref _questions, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadPoll()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetPollPercentAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                $"{Constants.EndPoints.GetPollAnswered}{_poll.IdPoll}",
                token.AccessToken);

            if (!response.IsSuccess)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            UserDialogs.Instance.HideLoading();
            PollPercentResponse listResponse = response.Result as PollPercentResponse;
            
            var listado = listResponse.QuestionsPercent.Select(q => new PollPercentItemViewModel
            {
                IdPregunta = q.IdPregunta,
                Pregunta = q.Pregunta,
                IdTipoPregunta = q.IdTipoPregunta,
                AnswersPercent = q.AnswersPercent.Select(a => new AnswerPercent
                {
                    IdRespuesta = a.IdRespuesta,
                    Respuesta = a.Respuesta,
                    TotalPorRespuestas = a.TotalPorRespuestas,
                    Porcentaje = a.Porcentaje,
                    AnswersUserPorcent = a.AnswersUserPorcent.Select(au => new AnswerUserPorcent
                    {
                        IdPregunta = au.IdPregunta,
                        IdRespuesta = au.IdRespuesta,
                        RespAbierta = au.RespAbierta
                    }).ToList()
                }).ToList(),
                AnswersUserPorcent = q.AnswersUserPorcent.Select(au => new AnswerUserPorcent
                {
                    IdPregunta = au.IdPregunta,
                    IdRespuesta = au.IdRespuesta,
                    RespAbierta = au.RespAbierta
                }).ToList()
            });
            
            RespuestasTotales = (int)listado.Select(x => x.RespuestasTotal).FirstOrDefault();
            Questions = new ObservableCollection<PollPercentItemViewModel>(listado);
        }
        #endregion [ Methods ]
    }
}
