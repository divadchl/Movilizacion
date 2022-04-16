using Deteccion.Views.Forms;
using Deteccion.Views.Navigation.Lists;
using Deteccion.Views.Onboarding;
using Elecciones.Common.Models;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ItemViewModels
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
            if(this.TypeNotification == (int)Elecciones.Common.Enums.TypeNotification.Poll)
            {
                await App.Current.MainPage.Navigation.PushAsync(new PollsListPage());
            }
            else if (this.TypeNotification == (int)Elecciones.Common.Enums.TypeNotification.News)
            {
                NewsNotification news = JsonConvert.DeserializeObject<NewsNotification>(this.SerializeObject);
                if(string.IsNullOrEmpty(news.Content))
                    await OpenBrowser(new Uri(news.UrlNews));
                else
                    await App.Current.MainPage.Navigation.PushAsync(new ArticleDetailPage(news));
            }
            else if (this.TypeNotification == (int)Elecciones.Common.Enums.TypeNotification.NoticeVote)
            {
                await App.Current.MainPage.Navigation.PushAsync(new VotePage());
            }
            else if (this.TypeNotification == (int)Elecciones.Common.Enums.TypeNotification.ValidationCredential)
            {
                await App.Current.MainPage.Navigation.PushAsync(new ResendCICPage(this.SerializeObject));
            }
        }

        public async Task OpenBrowser(Uri uri)
        {
            try
            {
                await Browser.OpenAsync(uri, new BrowserLaunchOptions
                {
                    LaunchMode = BrowserLaunchMode.SystemPreferred,
                    TitleMode = BrowserTitleMode.Hide,
                    PreferredToolbarColor = (Color)App.Current.Resources["AccentColor"],
                    PreferredControlColor = (Color)App.Current.Resources["AccentColor"]
                });
            }
            catch (Exception ex)
            {
                // An unexpected error occured. No browser may be installed on the device.
            }
        }
        #endregion [ Methods ]
    }
}
