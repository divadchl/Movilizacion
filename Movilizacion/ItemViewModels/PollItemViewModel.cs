using Elecciones.Common.Responses;
using Movilizacion.Views.Navigation.Lists;
using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ItemViewModels
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
        #endregion [ Methods ]
    }
}
