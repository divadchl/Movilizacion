using Acr.UserDialogs;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.Services;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.TasksFlow
{
    public class GraphicsViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isRefreshing;
        private ApiService _apiService;
        private GraphicsResponse _graphics;
        private ICommand _refreshCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public GraphicsViewModel()
        {
            _apiService = new ApiService();
            _ = LoadDataGraphics();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public GraphicsResponse Graphics
        {
            get => _graphics;
            set => SetProperty(ref _graphics, value);
        }

        public bool IsRefreshing 
        { 
            get => _isRefreshing;
            set => SetProperty(ref _isRefreshing, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RefreshCommand => _refreshCommand ?? (_refreshCommand = new Command(async () => await LoadDataGraphics()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadDataGraphics()
        {
            IsRefreshing = true;
            //UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                IsRefreshing = false;
                //UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            PersonMovRequest person = new PersonMovRequest
            {
                IdProcess = App.User.Process.IdProcess,
                UserName = App.User.UserName,
                IdState = App.User.Process.IdState
            };

            Response response = await _apiService.GetGraphicsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetGraphics,
                person,
                token.AccessToken);
           
            IsRefreshing = false;

            if (!response.IsSuccess)
            {
                //UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            Graphics = (GraphicsResponse)response.Result;

            //UserDialogs.Instance.HideLoading();
        }
        #endregion [ Methods ]
    }
}
