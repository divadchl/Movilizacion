using Deteccion.Responses;
using Deteccion.Views.Navigation.Lists;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion.ItemViewModels
{
    public class PollItemViewModel : PollResponse
    {
        #region [ Attributes ]
        private ICommand _selectPollCommand;
        #endregion [ Attributes ]
        
        #region [ Commands ]
        public ICommand SelectPollCommand => _selectPollCommand ?? (_selectPollCommand = new Command(SelectPollAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectPollAsync()
        {
            if(!this.Reply)
            {
                PollResponse poll = new PollResponse
                {
                    Questions = this.Questions,
                    IdPoll = this.IdPoll,
                    Poll = this.Poll,
                    Reply = this.Reply,
                    Validity = this.Validity
                };
                await App.Current.MainPage.Navigation.PushAsync(new PollListItemPage(poll));
            }
        }
        #endregion [ Methods ]
    }
}
