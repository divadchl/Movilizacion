using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.ItemViewModels;
using Deteccion.Models;
using Deteccion.Services;
using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Navigation
{
    public class PollListItemViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool flag;
        private ApiService _apiService;
        private bool _isEnabled;
        private ICommand _sendPollCommand;
        private Responses.PollResponse _poll;
        private ObservableCollection<Models.Question> _questions;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PollListItemViewModel(Responses.PollResponse poll)
        {
            _apiService = new ApiService();
            IsEnabled = true;
            Poll = poll;
            Title = Poll.Poll;
            Questions = new ObservableCollection<Models.Question>(poll.Questions);
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public bool IsEnabled 
        { 
            get => _isEnabled; 
            set => SetProperty(ref _isEnabled, value); 
        }
        public Responses.PollResponse Poll
        {
            get => _poll;
            set => SetProperty(ref _poll, value);
        }

        public ObservableCollection<Models.Question> Questions
        {
            get => _questions;
            set => SetProperty(ref _questions, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SendPollCommand => _sendPollCommand ?? (_sendPollCommand = new Command(SendPollAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SendPollAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Registering);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            List<AnswerUser> answersUser = new List<AnswerUser>();
            foreach (Models.Question question in Questions)
            {
                switch (question.IdTypeQuestion)
                {
                    case (int)TypeQuestion.Abierta:
                        question.AnswerUser.IdAnswer = null;
                        question.AnswerUser.IdQuestion = question.IdQuestion;
                        question.AnswerUser.IdPerson = user.IdPerson;
                        answersUser.Add(question.AnswerUser);
                        break;
                    case (int)TypeQuestion.Individual:
                        foreach (var answer in question.Answers)
                        {
                            if (answer.AnswerUser.IdAnswer != null)
                                answersUser.Add(answer.AnswerUser);
                        }
                        break;
                    case (int)TypeQuestion.Multiple:
                        foreach (var answer in question.Answers)
                        {
                            if (answer.AnswerUser.IdAnswer != null)
                                answersUser.Add(answer.AnswerUser);
                        }
                        break;
                    default:
                        break;
                }
            }

            SendPollRequest sendPoll = new SendPollRequest { AnswersUser = answersUser };
            Response response = await _apiService.SendPollAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostSendPoll,
                sendPoll);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (response.IsSuccess)
            {
                PollsListViewModel.GetInstance().LoadPollsAsync();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, TextStrings.InfoAnswerPoll, TextStrings.Accept));
                await App.Current.MainPage.Navigation.PopAsync();
                return;
            }
            else
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
        }

        private async Task<bool> ValidateDataAsync()
        {
            
            foreach (Models.Question question in Questions)
            {
                switch (question.IdTypeQuestion)
                {
                    case (int)TypeQuestion.Abierta:
                        if (string.IsNullOrEmpty(question.AnswerUser.OpenResponse) || string.IsNullOrWhiteSpace(question.AnswerUser.OpenResponse))
                        {
                            await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorQuestion + question.Query, TextStrings.Accept));
                            return false;
                        }
                        break;
                    case (int)TypeQuestion.Individual:
                        foreach (var answer in question.Answers)
                        {
                            if (answer.AnswerUser.IdAnswer != null)
                            {
                                flag = true;
                                break;
                            }
                            else
                            {
                                flag = false;
                            }
                        }

                        if (!flag)
                        {
                            await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorQuestion + question.Query, TextStrings.Accept));
                            return false;
                        }
                        break;
                    case (int)TypeQuestion.Multiple:
                        foreach (var answer in question.Answers)
                        {
                            if (answer.AnswerUser.IdAnswer != null)
                            {
                                flag = true;
                                break;
                            }
                            else
                            {
                                flag = false;
                            }
                        }

                        if (!flag)
                        {
                            await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorQuestion + question.Query, TextStrings.Accept));
                            return false;
                        }
                        break;
                    default:
                        break;
                }
            }
            return true;
        }
        #endregion [ Methods ]
    }
}
