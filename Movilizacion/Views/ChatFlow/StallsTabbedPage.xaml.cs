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
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.ChatFlow
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class StallsTabbedPage : ContentPage
    {
        StallsTabbedViewModel vm = new StallsTabbedViewModel();
        CancellationTokenSource cts;

        public StallsTabbedPage()
        {
            InitializeComponent();
            BindingContext = vm;
            _ = GetCurrentLocation();
            _ = LoadStallsAsync();
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

        private async Task LoadStallsAsync()
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
                Constants.EndPoints.PostGetStalls,
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

            List<StallItemViewModel> listStalls = result.Stalls.Select(s => new StallItemViewModel
            {
                IdStall = s.IdStall,
                StallType = s.StallType,
                Address = s.Address,
                Reference = s.Reference,
                Location = s.Location,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                IdTypeStall = s.IdTypeStall,
                TypeStall = s.TypeStall,
                IdFederalDistrict = s.IdFederalDistrict,
                FederalDistrict = s.FederalDistrict,
                IdState = s.IdState,
                State = s.State,
                IdMunicipality = s.IdMunicipality,
                Municipality = s.Municipality,
                IdLocalDistrict = s.IdLocalDistrict,
                LocalDistrict = s.LocalDistrict,
                IdSection = s.IdSection,
                Section = s.Section,
                ReportStalls = s.ReportStalls
            }).ToList();

            vm.Stalls = new ObservableCollection<StallItemViewModel>(listStalls);
            vm._lstStalls = listStalls;
            foreach (Stall stall in listStalls)
            {
                if(!(string.IsNullOrEmpty(stall.Latitude) && string.IsNullOrEmpty(stall.Longitude)))
                {
                    CustomPin pin = new CustomPin
                    {
                        Address = stall.Address,
                        Label = stall.Location,
                        Position = new Position(
                            double.Parse(stall.Latitude),
                            double.Parse(stall.Longitude)),
                        Type = PinType.Place,
                        Icon = stall.IdStatusStall,
                        TypeIcon = (int)TypeIcon.Stall
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