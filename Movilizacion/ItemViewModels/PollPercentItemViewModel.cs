using Elecciones.Common.Enums;
using Elecciones.Common.Responses;
using Movilizacion.Views.Navigation.Lists;
using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ItemViewModels
{
    public class PollPercentItemViewModel : QuestionPercent
    {
        #region [ Attributes ]
        private ICommand _selectQuestionCommand;
        #endregion [ Attributes ]

        #region [ Commands ]
        public ICommand SelectQuestionCommand => _selectQuestionCommand ?? (_selectQuestionCommand = new Command(SelectQuestionAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectQuestionAsync()
        {
            if (this.IdTipoPregunta == (int)TypeQuestion.Abierta)
            {
                var question = new QuestionPercent
                {
                    IdPregunta = this.IdPregunta,
                    Pregunta = this.Pregunta,
                    AnswersPercent = this.AnswersPercent,
                    AnswersUserPorcent = this.AnswersUserPorcent,
                    IdTipoPregunta = this.IdTipoPregunta
                };
                await App.Current.MainPage.Navigation.PushAsync(new PollListItemDetailPage(question));
            }
        }
        #endregion [ Methods ]
    }
}
