using Acr.UserDialogs;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Renders;
using Movilizacion.Services;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Maps
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MapPage : ContentPage
    {
        public MapPage()
        {
            InitializeComponent();
            //_ = GetCurrentLocation();
            //_ = LoadPersonsUsersAsync();
        }
        /*
        CancellationTokenSource cts;

        async Task GetCurrentLocation()
        {
            MyMap.IsShowingUser = true;
            try
            {
                var request = new GeolocationRequest(GeolocationAccuracy.Medium, TimeSpan.FromSeconds(10));
                cts = new CancellationTokenSource();
                var location = await Geolocation.GetLocationAsync(request, cts.Token);

                if (location != null)
                {
                    Position position = new Position(
                        location.Latitude,
                        location.Longitude);
                    MyMap.MoveToRegion(MapSpan.FromCenterAndRadius(
                        position,
                        Distance.FromKilometers(.5)));
                }
            }
            catch (FeatureNotSupportedException fnsEx)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, fnsEx.Message, TextStrings.Accept));
            }
            catch (FeatureNotEnabledException fneEx)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, fneEx.Message, TextStrings.Accept));
            }
            catch (PermissionException pEx)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, pEx.Message, TextStrings.Accept));
            }
            catch (Exception ex)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
            }
        }

        private async Task LoadPersonsUsersAsync()
        {
            ApiService _apiService = new ApiService();
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            //UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Preferences.Get(TextStrings.User, string.Empty));
            //PersonRequest person = new PersonRequest { IdPersona = user.IdPerson };
            PersonsRequest persons = new PersonsRequest { IdPersona = Guid.NewGuid() };

            Response response = await _apiService.GetPersonsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPersons,
                persons);

            if (!response.IsSuccess)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            PersonsResponse result = (PersonsResponse)response.Result;
            List<PersonItemViewModel> listPersons = result.Persons.Select(x => new PersonItemViewModel
            {
                IdPersona = x.IdPersona,
                Paterno = x.Paterno,
                Materno = x.Materno,
                Nombre = x.Nombre,
                Calle = x.Calle,
                NoExterior = x.NoExterior,
                NoInterior = x.NoInterior,
                Colonia = x.Colonia,
                Municipio = x.Municipio,
                Estado = x.Estado,
                Latitud = x.Latitud,
                Longitud = x.Longitud,
                IdMunicipio = x.IdMunicipio,
                IdDistritoFederal = x.IdDistritoFederal,
                IdDistritoLocal = x.IdDistritoLocal,
                IdSeccion = x.IdSeccion,
                IdEstado = x.IdEstado,
                IdTipoContactado = x.IdTipoContactado,
                TipoContacto = x.TipoContacto,
                Vote = x.Vote
            }).ToList();

            //vm.People = new ObservableCollection<PersonItemViewModel>(listPersons);
            //vm._lstPeople = listPersons;
            List<CustomPin> listCustomPin = new List<CustomPin>();
            foreach (Stall stall in result.Stalls)
            {
                CustomPin pin = new CustomPin
                {
                    Address = stall.Address,
                    Label = stall.Location,
                    Position = new Position(
                        double.Parse(stall.Latitude),
                        double.Parse(stall.Longitude)),
                    Type = PinType.Place
                };
                MyMap.Pins.Add(pin);
                MyMap.CustomPins.Add(pin);
            }

            foreach (PersonItemViewModel person in listPersons)
            {
                CustomPin pin = new CustomPin
                {
                    Address = person.Domicilio,
                    Label = person.NombreCompleto,
                    Position = new Position(
                        double.Parse(person.Latitud),
                        double.Parse(person.Longitud)),
                    Type = PinType.Place
                };
                MyMap.Pins.Add(pin);
                MyMap.CustomPins.Add(pin);
            }

            UserDialogs.Instance.HideLoading();
        }

        protected override void OnDisappearing()
        {
            if (cts != null && !cts.IsCancellationRequested)
                cts.Cancel();
            base.OnDisappearing();
        }
 */       
    }
}