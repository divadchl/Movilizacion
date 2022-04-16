using Elecciones.Common.Models;
using Movilizacion.Views.Articles;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ItemViewModels
{
    public class NewsItemViewModel : NewsNotification
    {
        #region [ Attributes ]
        private ICommand _selectNewsCommand;
        #endregion [ Attributes ]

        #region [ Commands ]
        public ICommand SelectNewsCommand => _selectNewsCommand ?? (_selectNewsCommand = new Command(SelectNewsAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectNewsAsync()
        {
            if (string.IsNullOrEmpty(this.Content))
            {
                await OpenBrowser(new Uri(this.UrlNews));
            }
            else
            {
                NewsNotification news = new NewsNotification
                {
                    Title = this.Title,
                    Type = this.Type,
                    UriImage = this.UriImage,
                    UrlNews = this.UrlNews,
                    Description = this.Description,
                    Content = this.Content
                };
                await App.Current.MainPage.Navigation.PushAsync(new NewsDetailPage(news));
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
