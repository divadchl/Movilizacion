using Elecciones.Common.Responses;
using System.Collections.ObjectModel;

namespace Movilizacion.ViewModels.Navigation
{
    public class PollListItemDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private QuestionPercent _question;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PollListItemDetailViewModel(QuestionPercent question)
        {
            Question = question;
            AnswerUsers = new ObservableCollection<AnswerUserPorcent>(Question.AnswersUserPorcent);
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public QuestionPercent Question 
        { 
            get => _question; 
            set => SetProperty(ref _question, value); 
        }

        public ObservableCollection<AnswerUserPorcent> AnswerUsers { get; set; }
        #endregion [ Properties ]
    }
}
