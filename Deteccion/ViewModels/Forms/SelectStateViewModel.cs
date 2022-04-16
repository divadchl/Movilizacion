using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Models;
using Deteccion.Services;
using Deteccion.Views.Forms;
using Elecciones.Common.Enums;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class SelectStateViewModel : ObservableObject
    {
        #region [ Attributes ]
        private TypeCredential _typeCredential;
        private StateResponse _state;
        private ObservableCollection<StateResponse> _states;
        private ApiService _apiService;
        private ICommand _selectCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public SelectStateViewModel(TypeCredential typeCredential = TypeCredential.None)
        {
            _typeCredential = typeCredential;
            _apiService = new ApiService();
            LoadStatesAsync();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public StateResponse State
        {
            get => _state;
            set => SetProperty(ref _state, value);
        }

        public ObservableCollection<StateResponse> States
        {
            get => _states;
            set => SetProperty(ref _states, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SelectCommand => _selectCommand ?? (_selectCommand = new Command(SelectAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            if(_typeCredential.Equals(TypeCredential.None))
                await App.Current.MainPage.Navigation.PushAsync(new ChangeCredentialPage(State));
            else
                await App.Current.MainPage.Navigation.PushAsync(new GetCredentialsPage(_typeCredential, State));
        }

        private async void LoadStatesAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.GetListAsync<StateResponse>(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetStates);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            List<StateResponse> list = (List<StateResponse>)response.Result;
            States = new ObservableCollection<StateResponse>(list);
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (State == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterState, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
