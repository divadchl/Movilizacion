using Acr.UserDialogs;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Controls.Popups;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Movilizacion.Views.ChatFlow;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.ChatFlow
{
    public class StallsTabbedViewModel : ObservableObject
    {
        #region [ Attributes ]
        public List<StallItemViewModel> _lstStalls;
        private bool _isRefreshing;
        private string _search;
        private ApiService _apiService;
        private ObservableCollection<StallItemViewModel> _stalls;
        private StallItemViewModel _stall;
        private ICommand _searchCommand;
        private ICommand _refreshCommand;
        private ICommand _statusStallCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]

        public StallsTabbedViewModel()
        {
            instance = this;
            _apiService = new ApiService();
        }
        #endregion [ Constructor ]

        #region Singleton
        private static StallsTabbedViewModel instance;

        public static StallsTabbedViewModel GetInstance()
        {
            return instance;
        }
        #endregion

        #region [ Properties ]
        public ObservableCollection<StallItemViewModel> Stalls
        {
            get => _stalls;
            set => SetProperty(ref _stalls, value);
        }

        public StallItemViewModel Stall
        {
            get => _stall;
            set
            {
                SetProperty(ref _stall, value);
                _ = SelectStall();
            }
        }

        public string Search
        {
            get => _search;
            set
            {
                SetProperty(ref _search, value);
                ShowStalls();
            }
        }

        public bool IsRefreshing
        {
            get => _isRefreshing;
            set => SetProperty(ref _isRefreshing, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RefreshCommand => _refreshCommand ?? (_refreshCommand = new Command(async () => await RefreshAsync()));
        public ICommand SerachCommand => _searchCommand ?? (_searchCommand = new Command(ShowStalls));
        public ICommand StatusStallCommand => _statusStallCommand ?? (_statusStallCommand = new Command(async (stall) => await StatusStallAsync((StallItemViewModel)stall)));
        #endregion

        #region [ Methods ]
        public async Task LoadStallsAsync()
        {
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
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

            Response response = await _apiService.GetPersonsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetStalls,
                person,
                token.AccessToken);

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

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

            _lstStalls = listStalls;
            ShowStalls();
        }

        private void ShowStalls()
        {
            if (string.IsNullOrEmpty(Search))
            {
                Stalls = new ObservableCollection<StallItemViewModel>(_lstStalls.Select(s => new StallItemViewModel
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
                }).ToList());
            }
            else
            {
                Stalls = new ObservableCollection<StallItemViewModel>(_lstStalls.Select(s => new StallItemViewModel
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
                }).Where(s => s.Address.ToLower().Contains(Search.ToLower()) || s.Location.ToLower().Contains(Search.ToLower())));
            }
        }

        private async Task StatusStallAsync(StallItemViewModel stall)
        {
            await PopupNavigation.Instance.PushAsync(new StatusDialogPage(stall));
        }
        
        private async Task SelectStall()
        {
            await App.Current.MainPage.Navigation.PushAsync(new StallDetailPage(Stall));
        }

        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadStallsAsync();
            IsRefreshing = false;
        }
        #endregion
    }
}
