using Acr.UserDialogs;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Movilizacion.Views.ChatFlow;
using Movilizacion.Views.Maps;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.ChatFlow
{
    public class PersonsTabbedViewModel : ObservableObject
    {
        #region [ Attributes ]
        public List<PersonItemViewModel> _lstPeople;
        private bool _isRefreshing;
        private string _search;
        private bool _isToggled;
        private ApiService _apiService;
        private ObservableCollection<PersonItemViewModel> _people;
        private PersonItemViewModel _person;
        private ICommand _searchCommand;
        private ICommand _contactPersonCommand;
        private ICommand _refreshCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]

        public PersonsTabbedViewModel()
        {
            instance = this;
            _apiService = new ApiService();
        }
        #endregion [ Constructor ]

        #region Singleton
        private static PersonsTabbedViewModel instance;

        public static PersonsTabbedViewModel GetInstance()
        {
            return instance;
        }
        #endregion

        #region [ Properties ]
        public ObservableCollection<PersonItemViewModel> People
        { 
            get => _people; 
            set => SetProperty(ref _people, value); 
        }

        public PersonItemViewModel Person
        {
            get => _person;
            set
            {
                SetProperty(ref _person, value);
                _ = SelectPerson();
            }
        }

        public string Search
        {
            get => _search;
            set
            {
                SetProperty(ref _search, value);
                ShowPersons();
            }
        }

        public bool IsToggled 
        { 
            get => _isToggled;
            set
            {
                SetProperty(ref _isToggled, value);
                FilterPersons();
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
        public ICommand SerachCommand => _searchCommand ?? (_searchCommand = new Command(ShowPersons));
        public ICommand ContactPersonCommand => _contactPersonCommand ?? (_contactPersonCommand = new Command(async (person) => await ContactPersonAsync((PersonItemViewModel)person)));
        #endregion

        #region [ Methods ]
        public async Task LoadPersonsUsersAsync()
        {
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            PersonMovRequest person = new PersonMovRequest 
            { 
                IdProcess = App.User.Process.IdProcess,
                UserName = App.User.UserName,
                IdState = App.User.Process.IdState
            };

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetPersonsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetPersons,
                person,
                token.AccessToken);

            if (!response.IsSuccess)
            {
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
                Contact = x.Contact,
                Address = x.Address
            }).ToList();

            _lstPeople = listPersons;
            ShowPersons();
        }

        private void ShowPersons()
        {
            if (string.IsNullOrEmpty(Search))
            {
                People = new ObservableCollection<PersonItemViewModel>(_lstPeople.Select(p => new PersonItemViewModel
                {
                    IdPersona = p.IdPersona,
                    Paterno = p.Paterno,
                    Materno = p.Materno,
                    Nombre = p.Nombre,
                    Calle = p.Calle,
                    NoExterior = p.NoExterior,
                    NoInterior = p.NoInterior,
                    Colonia = p.Colonia,
                    Municipio = p.Municipio,
                    Estado = p.Estado,
                    Latitud = p.Latitud,
                    Longitud = p.Longitud,
                    Contact = p.Contact,
                    Address = p.Address
                }).ToList());
            }
            else
            {
                People = new ObservableCollection<PersonItemViewModel>(_lstPeople.Select(p => new PersonItemViewModel
                {
                    IdPersona = p.IdPersona,
                    Paterno = p.Paterno,
                    Materno = p.Materno,
                    Nombre = p.Nombre,
                    Calle = p.Calle,
                    NoExterior = p.NoExterior,
                    NoInterior = p.NoInterior,
                    Colonia = p.Colonia,
                    Municipio = p.Municipio,
                    Estado = p.Estado,
                    Latitud = p.Latitud,
                    Longitud = p.Longitud,
                    Contact = p.Contact,
                    Address = p.Address
                }).Where(p => p.NombreCompleto.ToLower().Contains(Search.ToLower()) || p.Domicilio.ToLower().Contains(Search.ToLower())));
            }
        }

        private void FilterPersons()
        {
            if (IsToggled)
            {
                People = new ObservableCollection<PersonItemViewModel>(_lstPeople.Select(p => new PersonItemViewModel
                {
                    IdPersona = p.IdPersona,
                    Paterno = p.Paterno,
                    Materno = p.Materno,
                    Nombre = p.Nombre,
                    Calle = p.Calle,
                    NoExterior = p.NoExterior,
                    NoInterior = p.NoInterior,
                    Colonia = p.Colonia,
                    Municipio = p.Municipio,
                    Estado = p.Estado,
                    Latitud = p.Latitud,
                    Longitud = p.Longitud,
                    Contact = p.Contact,
                    Address = p.Address
                }).Where(p => p.Contact?.TipoContacto.ToLower() == TextStrings.Vote.ToLower()).ToList());
            }
            else
            {
                People = new ObservableCollection<PersonItemViewModel>(_lstPeople.Select(p => new PersonItemViewModel
                {
                    IdPersona = p.IdPersona,
                    Paterno = p.Paterno,
                    Materno = p.Materno,
                    Nombre = p.Nombre,
                    Calle = p.Calle,
                    NoExterior = p.NoExterior,
                    NoInterior = p.NoInterior,
                    Colonia = p.Colonia,
                    Municipio = p.Municipio,
                    Estado = p.Estado,
                    Latitud = p.Latitud,
                    Longitud = p.Longitud,
                    Contact = p.Contact,
                    Address = p.Address,
                }).ToList());
            }
        }
        private async Task ContactPersonAsync(PersonItemViewModel person)
        {
            await PopupNavigation.Instance.PushAsync(new IrregularDialog(person));
        }

        private async Task SelectPerson()
        {
            await App.Current.MainPage.Navigation.PushAsync(new PersonDetailPage(Person.IdPersona));
        }

        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadPersonsUsersAsync();
            IsRefreshing = false;
        }
        #endregion
    }
}