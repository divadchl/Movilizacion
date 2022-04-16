using Acr.UserDialogs;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Messages
{
    public class GetListContactsViewModel : ObservableObject
    {
        #region [ Attributes ]
        private string _search;
        private IContactsService _contactService;
        private ObservableCollection<ContactItemViewModel> _myContacts;
        private List<ContactItemViewModel> _filteredContacts;
        private ObservableCollection<ContactItemViewModel> _contacts;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public GetListContactsViewModel()
        {
            _contactService = DependencyService.Get<IContactsService>();
            Contacts = new ObservableCollection<ContactItemViewModel>();
            MyContacts = new ObservableCollection<ContactItemViewModel>();
            BindingBase.EnableCollectionSynchronization(MyContacts, null, ObservableCollectionCallback);
            _contactService.OnContactLoaded += OnContactLoaded;
            _ = LoadContacts();
            SearchCommand = new Command(ShowContacts);
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ICommand SearchCommand { get; }

        public ObservableCollection<ContactItemViewModel> Contacts
        {
            get => _contacts;
            set => SetProperty(ref _contacts, value);
        }

        public ObservableCollection<ContactItemViewModel> MyContacts
        {
            get => _myContacts;
            set => SetProperty(ref _myContacts, value);
        }

        public string Search
        {
            get => _search;
            set
            {
                SetProperty(ref _search, value);
                ShowContacts();
            }
        }

        public List<ContactItemViewModel> FilteredContacts
        {
            get => _filteredContacts;
            set => SetProperty(ref _filteredContacts, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        #endregion [ Commands ]

        #region [ Methods ]
        private void ShowContacts()
        {
            if (string.IsNullOrEmpty(Search))
            {
                Contacts = new ObservableCollection<ContactItemViewModel>(_myContacts.Select(c => new ContactItemViewModel()
                {
                    Name = c.Name,
                    Image = c.Image,
                    Email = c.Email,
                    Emails = c.Emails,
                    PhoneNumber = c.PhoneNumber,
                    PhoneNumbers = c.PhoneNumbers
                }).ToList());
            }
            else
            {
                Contacts
                    = new ObservableCollection<ContactItemViewModel>(_myContacts.Select(c => new ContactItemViewModel()
                    {
                        Name = c.Name,
                        Image = c.Image,
                        Email = c.Email,
                        Emails = c.Emails,
                        PhoneNumber = c.PhoneNumber,
                        PhoneNumbers = c.PhoneNumbers
                    }).Where(p => p.Name.ToLower().Contains(Search.ToLower())));
            }
        }

        private void ObservableCollectionCallback(IEnumerable collection, object context, Action accessMethod, bool writeAccess)
        {
            lock (collection)
            {
                accessMethod?.Invoke();
            }
        }

        private void OnContactLoaded(object sender, ContactEventArgs e)
        {
            MyContacts.Add(e.Contact);
            ShowContacts();
        }

        private async Task LoadContacts()
        {
            try
            {
                UserDialogs.Instance.ShowLoading(TextStrings.Loading);
                await _contactService.RetrieveContactsAsync();
                UserDialogs.Instance.HideLoading();
            }
            catch (TaskCanceledException ex)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
            }
        }
        #endregion [ Methods ]
    }
}
