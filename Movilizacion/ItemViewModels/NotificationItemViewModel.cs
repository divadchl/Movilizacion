using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ItemViewModels
{
    public class NotificationItemViewModel : Models.Notification
    {
        #region [ Attributes ]
        private ICommand _selectNotificationCommand;
        #endregion [ Attributes ]

        #region [ Commands ]
        public ICommand SelectNotificationCommand => _selectNotificationCommand ?? (_selectNotificationCommand = new Command(SelectNotificationAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectNotificationAsync()
        {

        }
        #endregion [ Methods ]
    }
}
