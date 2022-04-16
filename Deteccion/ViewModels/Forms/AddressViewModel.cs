using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class AddressViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private StateResponse _state;
        private MunicipalityResponse _municipality;
        private ObservableCollection<StateResponse> _states;
        private ObservableCollection<MunicipalityResponse> _municipalities;
        private ApiService _apiService;
        private AddressFull _address;
        private ICommand _saveCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public AddressViewModel()
        {
            _apiService = new ApiService();
            IsEnabled = true;
            Address = new AddressFull();
            LoadStatesAsync();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public bool IsEnabled 
        { 
            get => _isEnabled; 
            set => SetProperty(ref _isEnabled, value); 
        }

        public AddressFull Address 
        { 
            get => _address; 
            set => SetProperty(ref _address, value); 
        }

        public AddressFullRequest AddressRequest { get; set; }

        public StateResponse State
        {
            get => _state;
            set
            {
                SetProperty(ref _state, value);
                LoadMunicipalitiesAsync();
            }
        }

        public ObservableCollection<StateResponse> States
        {
            get => _states;
            set => SetProperty(ref _states, value);
        }

        public MunicipalityResponse Municipality
        {
            get => _municipality;
            set => SetProperty(ref _municipality, value);
        }

        public ObservableCollection<MunicipalityResponse> Municipalities
        {
            get => _municipalities;
            set => SetProperty(ref _municipalities, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SaveCommand => _saveCommand ?? (_saveCommand = new Command(SaveAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SaveAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Saving);
            IsEnabled = false;
            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            Address.State = State.IdState;
            Address.Municipality = Municipality.IdMunicipality;
            AddressRequest = new AddressFullRequest
            {
                IdPersona = user.IdPerson,
                Address = Address
            };

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.RegisterAddressAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRegisterAddress,
                AddressRequest);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorSaveAddress, TextStrings.Accept));
                return;
            }

            await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoSaveAddress });
            await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        }

        private async void LoadStatesAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.GetListAsync<StateResponse>(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetStates);

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            List<StateResponse> list = (List<StateResponse>)response.Result;
            States = new ObservableCollection<StateResponse>(list);
        }

        private async void LoadMunicipalitiesAsync()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            IsEnabled = false;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.GetListAsync<MunicipalityResponse>(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                $"{Constants.EndPoints.GetMunicipalities}{State.IdState}");

            UserDialogs.Instance.HideLoading();
            IsEnabled = true;

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, response.Message, TextStrings.Accept));
                return;
            }

            List<MunicipalityResponse> list = (List<MunicipalityResponse>)response.Result;
            Municipalities = new ObservableCollection<MunicipalityResponse>(list);
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(Address.Street))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterStreet, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Address.OutdoorNumber))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterOutdoor, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Address.Colony))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterColony, TextStrings.Accept));
                return false;
            }

            if (State == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterState, TextStrings.Accept));
                return false;
            }

            if (string.IsNullOrEmpty(Address.CP))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCP, TextStrings.Accept));
                return false;
            }

            if (Municipality == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterMunicipality, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
