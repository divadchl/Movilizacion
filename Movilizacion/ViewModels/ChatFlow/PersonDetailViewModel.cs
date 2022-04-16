using Acr.UserDialogs;
using Elecciones.Common.Helpers;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.Services;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.OpenWhatsApp;

namespace Movilizacion.ViewModels.ChatFlow
{
    public class PersonDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private string _estado;
        private string _municipio;
        private string _seccion;
        private string _domicilio;
        private ImageSource _imageFront;
        private ApiService _apiService;
        private PersonDetailResponse _person;
        private FilesHelper _filesHelper;
        private Guid _idPerson;
        private ICommand _whatsAppCommand;
        private ICommand _phoneCallCommand;
        private ICommand _localizeCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public PersonDetailViewModel(Guid person)
        {
            _apiService = new ApiService();
            _filesHelper = new FilesHelper();
            _idPerson = person;
            _ = LoadPerson();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string Domicilio
        {
            get => _domicilio;
            set => SetProperty(ref _domicilio, value);
        }
        public string Estado
        {
            get => _estado;
            set => SetProperty(ref _estado, value);
        }
        public string Municipio
        {
            get => _municipio;
            set => SetProperty(ref _municipio, value);
        }
        public string Seccion
        {
            get => _seccion;
            set => SetProperty(ref _seccion, value);
        }

        public PersonDetailResponse Person 
        { 
            get => _person; 
            set => SetProperty(ref _person, value); 
        }

        public ImageSource ImageFront
        {
            get => _imageFront;
            set => SetProperty(ref _imageFront, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand WhatsAppCommand => _whatsAppCommand ?? (_whatsAppCommand = new Command(WhatsApp));
        public ICommand PhoneCallCommand => _phoneCallCommand ?? (_phoneCallCommand = new Command(PhoneCall));
        public ICommand LocalizeCommand => _localizeCommand ?? (_localizeCommand = new Command(async () => await LocalizeAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private  async Task LoadPerson()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }
            
            PersonRequest person = new PersonRequest { IdPerson = _idPerson };
            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetPersonAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPerson,
                person,
                token.AccessToken);

            if (!response.IsSuccess)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
            UserDialogs.Instance.HideLoading();

            Person = (PersonDetailResponse)response.Result;
            ImageFront = ImageSource.FromStream(() =>
            {
                return _filesHelper.ArrayToImage(Person.Documento);
            });
            Domicilio = Person.Address ==null 
                ? $"{Person.Calle} {Person.NoExterior} {Person.NoInterior}, {Person.Colonia}, {Person.Municipio}"
                : $"{Person.Address.Direccion} {Person.Address.NumeroExterior} {Person.Address.NumeroInterior}, {Person.Address.Colonia}, {Person.Address.Municipio}";
            Estado = Person.Address == null ? $"{Person.NoEstado}" : $"{Person.Address.Estado}";
            Municipio = Person.Address == null ? $"{Person.NoMunicipio}" : $"{Person.Address.Municipio}";
            Seccion = Person.Address == null ? $"{Person.Seccion}" : string.Empty;
        }

        private void WhatsApp()
        {
            try
            {
                string phoneNumber = $"{TextStrings.CodeContry}{Person.Telefono}";
                Chat.Open(phoneNumber, string.Empty);
            }
            catch (Exception ex)
            {
                ProcessException(ex);
            }
        }

        private async Task LocalizeAsync()
        {
            Location location;
            try
            {
                if(Person.Address == null)
                    location = new Location(double.Parse(Person.Latitud), double.Parse(Person.Longitud));
                else
                    location = new Location(double.Parse(Person.Address.Latitud), double.Parse(Person.Address.Longitud));
                
                var options = new MapLaunchOptions { NavigationMode = NavigationMode.Driving };
                await Map.OpenAsync(location, options);
            }
            catch (Exception ex)
            {
                ProcessException(ex);
            }

        }

        public void PhoneCall()
        {
            try
            {
                PhoneDialer.Open(Person.Telefono);
            }
            catch (ArgumentNullException anEx)
            {
                ProcessException(anEx);
            }
            catch (FeatureNotSupportedException ex)
            {
                ProcessException(ex);
            }
            catch (Exception ex)
            {
                ProcessException(ex);
            }
        }

        private async void ProcessException(Exception ex)
        {
            if (ex != null)
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
        }
        #endregion [ Methods ]
    }
}
