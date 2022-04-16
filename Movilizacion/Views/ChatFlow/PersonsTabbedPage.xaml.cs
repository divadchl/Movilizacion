using Acr.UserDialogs;
using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Renders;
using Movilizacion.Services;
using Movilizacion.ViewModels.ChatFlow;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.ChatFlow
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PersonsTabbedPage : ContentPage
    {
        PersonsTabbedViewModel vm = new PersonsTabbedViewModel();
        CancellationTokenSource cts;

        public PersonsTabbedPage()
        {
            InitializeComponent();
            BindingContext = vm;
            _ = GetCurrentLocation();
            _ = LoadPersonsUsersAsync();
        }

        private async Task GetCurrentLocation()
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
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, fnsEx.Message, TextStrings.Accept));
            }
            catch (FeatureNotEnabledException fneEx)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, fneEx.Message, TextStrings.Accept));
            }
            catch (PermissionException pEx)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPermissionsLocation, TextStrings.Accept));
            }
            catch (Exception ex)
            {
                UserDialogs.Instance.HideLoading();
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

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            PersonMovRequest personMov = new PersonMovRequest 
            { 
                IdProcess = App.User.Process.IdProcess,
                UserName = App.User.UserName,
                IdState = App.User.Process.IdState
            };

            Response response = await _apiService.GetPersonsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPersons,
                personMov,
                token.AccessToken);

            if (!response.IsSuccess)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
            UserDialogs.Instance.HideLoading();
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
                Contact = x.Contact,
                Address = x.Address
            }).ToList();

            vm.People = new ObservableCollection<PersonItemViewModel>(listPersons);
            vm._lstPeople = listPersons;

            foreach (PersonItemViewModel person in listPersons)
            {
                if (!(string.IsNullOrEmpty(person.Latitud) && string.IsNullOrEmpty(person.Longitud)))
                {
                    CustomPin pin = new CustomPin
                    {
                        Address = person.Domicilio,
                        Label = person.NombreCompleto,
                        Position = new Position(
                            double.Parse(person.Latitud),
                            double.Parse(person.Longitud)),
                        Type = PinType.Place,
                        Icon = person.Contact.IdTipoContacto,
                        TypeIcon = (int)TypeIcon.Person
                    };
                    MyMap.Pins.Add(pin);
                    MyMap.CustomPins.Add(pin);
                }
            }
        }

        protected override void OnDisappearing()
        {
            if (cts != null && !cts.IsCancellationRequested)
                cts.Cancel();
            base.OnDisappearing();
        }
    }
}