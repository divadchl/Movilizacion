using Deteccion.Helpers;
using Deteccion.Views.Forms;
using Rg.Plugins.Popup.Services;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion
{
    public class WalkthroughViewModel
    {
        #region [ Attributes ]
        private bool _hasStreet;
        private ICommand _yesCommand;
        private ICommand _noCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public WalkthroughViewModel(bool hasStreet)
        {
            _hasStreet = hasStreet;
        }
        #endregion [ Constructor ]

        #region [ Commands ]
        public ICommand YesCommand => _yesCommand ?? (_yesCommand = new Command(async () => await YesAsync()));

        public ICommand NoCommand => _noCommand ?? (_noCommand = new Command(async () => await NoAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task YesAsync()
        {
            if (_hasStreet)
            {
                await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
            }
            else
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, TextStrings.InfoRegisterAddressINE, TextStrings.Accept));
                await App.Current.MainPage.Navigation.PushAsync(new AddressINEPage());
            }
        }

        private async Task NoAsync()
        {
            await App.Current.MainPage.Navigation.PushAsync(new AddressPage());
        } 
        #endregion
    }
}
