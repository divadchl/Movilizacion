using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.ItemViewModels;
using Deteccion.Services;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Xamarin.Essentials;

namespace Deteccion
{
    public class ArticlesListViewModel : ObservableObject
    {
        #region [ Attributes ]
        private ApiService _apiService;
        private ObservableCollection<NewsItemViewModel> _news;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ArticlesListViewModel()
        {
            _apiService = new ApiService();
            _ = LoadNewsAsync();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ObservableCollection<NewsItemViewModel> News
        {
            get => _news;
            set => SetProperty(ref _news, value);
        }
        #endregion [ Properties ]

        #region [ Methods ]
        private async Task LoadNewsAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            PersonRequest person = new PersonRequest 
            { 
                IdPerson = user.IdPerson,
                IdProcess = user.IdProcess
            };

            Response response = await _apiService.GetNewsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetNews,
                person);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            List<NewsNotification> listResponse = response.Result as List<NewsNotification>;
            var list = listResponse.Select(x => new NewsItemViewModel
            {
                Title = x.Title,
                Type = x.Type,
                UriImage = x.UriImage,
                UrlNews = x.UrlNews,
                Description = x.Description,
                Content = x.Content
            });
            News = new ObservableCollection<NewsItemViewModel>(list);
        }
        #endregion [ Methods ]
    }
}
