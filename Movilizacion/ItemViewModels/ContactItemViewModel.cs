using Movilizacion.Helpers;
using Movilizacion.Models;
using Movilizacion.Views.Social;
using System.Windows.Input;
using Xamarin.Forms;

namespace Movilizacion.ItemViewModels
{
    public class ContactItemViewModel : Contact
    {
        #region [ Attributes ]
        private ICommand _selectContactoCommand;
        #endregion [ Attributes ]

        #region [ Commands ]
        public ICommand SelectContactoCommand => _selectContactoCommand ?? (_selectContactoCommand = new Command(SelectContactAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void SelectContactAsync()
        {
            Contact contact = new Contact
            {
                Image = this.Image,
                Name = this.Name,
                Emails = this.Emails,
                PhoneNumbers = this.PhoneNumbers
            };
            await App.Current.MainPage.Navigation.PushAsync(new ContactDetailPage(contact));
        }
        #endregion [ Methods ]
    }
}
