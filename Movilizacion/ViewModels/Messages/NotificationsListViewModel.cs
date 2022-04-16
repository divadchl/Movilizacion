using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Messages
{
    public class NotificationsListViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isRefreshing;
        private static NotificationsListViewModel _instance = null;
        private List<NotificationItemViewModel> _notifications;
        private NotificationItemViewModel _notification;
        private ICommand _refreshCommand;
        private ICommand _deleteNotificationCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public NotificationsListViewModel()
        {
            _instance = this;
            LoadNotifications();
        }
        #endregion [ Constructor ]

        #region [ Singleton ]
        public static NotificationsListViewModel Instance()
        {
            if (_instance == null)
                _instance = new NotificationsListViewModel();

            return _instance;
        }
        #endregion[ Singleton ]


        #region [ Properties ]
        public List<NotificationItemViewModel> Notifications
        {
            get => _notifications;
            set => SetProperty(ref _notifications, value);
        }
        public NotificationItemViewModel Notification
        {
            get => _notification;
            set => SetProperty(ref _notification, value);
        }

        public bool IsRefreshing
        {
            get => _isRefreshing;
            set => SetProperty(ref _isRefreshing, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RefreshCommand => _refreshCommand ?? (_refreshCommand = new Command(Refresh));
        public ICommand DeleteNotificationCommand => _deleteNotificationCommand ?? (_deleteNotificationCommand = new Command(async (notification) => await DeleteNotificationAsync((NotificationItemViewModel)notification)));
        #endregion [ Commands ]

        #region [ Methods ]
        public void LoadNotifications()
        {
            var notifications = App.NotificationRepository.GetAll();
            Notifications = notifications.Select(n => new NotificationItemViewModel
            {
                Id = n.Id,
                Icon = n.Icon,
                Title = n.Title,
                Description = n.Description,
                DateNotification = n.DateNotification,
                SerializeObject = n.SerializeObject,
                TypeNotification = n.TypeNotification
            }).ToList();
        }

        private void Refresh()
        {
            IsRefreshing = true;
            LoadNotifications();
            IsRefreshing = false;
        }

        private async Task DeleteNotificationAsync(NotificationItemViewModel notification)
        {
            bool answer = await App.Current.MainPage.DisplayAlert(
                TextStrings.Warning,
                TextStrings.WarningDeleteNotification,
                TextStrings.Accept,
                TextStrings.Cancel);

            if (answer)
            {
                App.NotificationRepository.Delete(notification.Id);
                LoadNotifications();
                await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoDeleteNotification });
            }
        }
        #endregion [ Methods ]
    }
}
