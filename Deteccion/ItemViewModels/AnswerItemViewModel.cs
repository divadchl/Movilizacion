using Deteccion.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion.ItemViewModels
{
    public class AnswerItemViewModel : Models.Answer
    {
        #region [ Attributes ]
        private bool _isChecked;
        private bool _isClicked;
        private ICommand _selectCheckCommand;
        private ICommand _selectClickCommand;
        #endregion [ Attributes ]

        #region [ Properties ]
        public AnswerUser AnswerUser { get; set; } = new AnswerUser();
        public bool IsChecked 
        { 
            get => _isChecked; 
            set => SetProperty(ref _isChecked, value); 
        }

        public bool IsClicked
        {
            get => _isClicked;
            set
            {
                SetProperty(ref _isClicked, value);
                if (!_isClicked)
                    AnswerUser = new AnswerUser();
            }
            
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SelectCheckCommand => _selectCheckCommand ?? (_selectCheckCommand = new Command(SelectCheckAsync));
        public ICommand SelectClickCommand => _selectClickCommand ?? (_selectClickCommand = new Command(SelectClickAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private void SelectCheckAsync()
        {
            if(_isChecked)
            {
                UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
                AnswerUser = new AnswerUser
                {
                    IdAnswer = this.IdAnswer,
                    IdQuestion = this.IdQuestion,
                    IdPerson = user.IdPerson,
                };
            }
            else
            {
                AnswerUser = new AnswerUser();
            }
            
        }

        private void SelectClickAsync()
        {
            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            AnswerUser = new AnswerUser
            {
                IdAnswer = this.IdAnswer,
                IdQuestion = this.IdQuestion,
                IdPerson = user.IdPerson,
            };
        }
        #endregion [ Methods ]

        //private Answer _selectedAnswer;

        //public Answer SelectedAnswer
        //{
        //    get => _selectedAnswer;
        //    set
        //    {
        //        SetProperty(ref _selectedAnswer, value);
        //        UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
        //        AnswerUser = new AnswerUser
        //        {
        //            IdAnswer = _selectedAnswer.IdAnswer,
        //            IdQuestion = _selectedAnswer.IdQuestion,
        //            IdPerson = user.IdPerson,
        //            //TODO Eliminar
        //            OpenResponse = _selectedAnswer.Response
        //        };
        //    }
        //}
    }
}
