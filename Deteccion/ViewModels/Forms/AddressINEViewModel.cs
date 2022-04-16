using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class AddressINEViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private ApiService _apiService;
        private AddressINE _address;
        private ICommand _saveCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public AddressINEViewModel()
        {
            _apiService = new ApiService();
            _isEnabled = true;
            Address = new AddressINE();
            AddressRequest = new AddressINERequest();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public AddressINE Address
        {
            get => _address;
            set => SetProperty(ref _address, value);
        }

        public AddressINERequest AddressRequest { get; set; }
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
            AddressRequest.IdPersona = user.IdPerson;
            AddressRequest.Address = Address;
            
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                IsEnabled = true;
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.RegisterAddressINEAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRegisterAddressINE,
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

            return true;
        }
        #endregion [ Methods ]
    }
}
