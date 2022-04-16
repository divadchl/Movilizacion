using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Deteccion.Views.Messages;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Navigation
{
    public class GuestTabViewModel : ObservableObject
    {
        #region [ Attributes ]
        private int _guests;
        private int _confirmed;
        private bool _isRefreshing;
        private ApiService _apiService;
        private ICommand _addContactCommand;
        private ICommand _refreshCommand;
        private ObservableCollection<Models.Contact> _contacts;
        private ObservableCollection<Models.Contact> _confirmedGuests;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public GuestTabViewModel()
        {
            instance = this;
            _apiService = new ApiService();
            ConfirmedGuests = new ObservableCollection<Models.Contact>();
            Contacts = new ObservableCollection<Models.Contact>();
            _ = LoadDataAsync();
        }
        #endregion [ Constructor ]

        #region Singleton
        private static GuestTabViewModel instance;

        public static GuestTabViewModel GetInstance()
        {
            return instance;
        }

        #endregion

        #region [ Properties ]
        public int Confirmed
        {
            get => _confirmed;
            set => SetProperty(ref _confirmed, value);
        }

        public int Guests
        {
            get => _guests;
            set => SetProperty(ref _guests, value);
        }
        public bool IsRefreshing
        {
            get => _isRefreshing;
            set => SetProperty(ref _isRefreshing, value);
        }

        public ObservableCollection<Models.Contact> Contacts
        {
            get => _contacts;
            set => SetProperty(ref _contacts, value);
        }

        public ObservableCollection<Models.Contact> ConfirmedGuests
        {
            get => _confirmedGuests;
            set => SetProperty(ref _confirmedGuests, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand AddContactCommand => _addContactCommand ?? (_addContactCommand = new Command(AddContactAsync));

        public ICommand RefreshCommand => _refreshCommand ?? (_refreshCommand = new Command(async () =>
        {
            await LoadDataAsync();
        }));
        #endregion [ Commands ]

        #region [ Methods ]

        private async Task LoadDataAsync()
        {
            IsRefreshing = true;
            await LoadDataGuestsAsync();
            await LoadDataConfirmedAsync();
            IsRefreshing = false;
        }

        public async Task LoadDataGuestsAsync()
        {
            Contacts.Clear();
            //UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                //UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            PersonRequest person = new PersonRequest { IdPerson = user.IdPerson };

            Response response = await _apiService.GetListGuestNotConfirmAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetGuestNotConfirm,
                person);

            if (!response.IsSuccess)
            {
                //UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            //UserDialogs.Instance.HideLoading();

            var listResponse = response.Result as List<GuestsResponse>;
            var lst = listResponse.Select(x => new Models.Contact
            {
                Name = x.Nombre,
                Image = TextStrings.ImageContact,
                Email = string.Empty,
                PhoneNumber = string.Empty,
                Emails = null,
                PhoneNumbers = null
            });
            Contacts = new ObservableCollection<Models.Contact>(lst);
            Guests = Contacts.Count;
        }

        public async Task LoadDataConfirmedAsync()
        {
            ConfirmedGuests.Clear();
            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                //UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            //UserDialogs.Instance.ShowLoading(TextStrings.Loading);
            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            PersonRequest person = new PersonRequest { IdPerson = user.IdPerson };

            Response response = await _apiService.GetListGuestConfirmAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetGuestConfirm,
                person);

            //UserDialogs.Instance.HideLoading();
            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            var listResponse = response.Result as List<GuestsResponse>;
            var lst = listResponse.Select(x => new Models.Contact
            {
                Name = x.Nombre,
                Image = TextStrings.ImageContact,
                Email = string.Empty,
                PhoneNumber = string.Empty,
                Emails = null,
                PhoneNumbers = null
            });
            ConfirmedGuests = new ObservableCollection<Models.Contact>(lst);
            Confirmed = ConfirmedGuests.Count;
        }

        private async void AddContactAsync()
        {
            await App.Current.MainPage.Navigation.PushAsync(new GetListContactsPage());
        }
        #endregion [ Methods ]
    }
}
