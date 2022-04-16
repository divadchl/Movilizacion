using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.ChatFlow
{
    public class StallDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private StallItemViewModel _stall;
        private ICommand _localizeCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public StallDetailViewModel(StallItemViewModel stall)
        {
            _stall = stall;
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public StallItemViewModel Stall 
        { 
            get => _stall; 
            set => SetProperty(ref _stall, value); 
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand LocalizeCommand => _localizeCommand ?? (_localizeCommand = new Command(async () => await LocalizeAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        
        private async Task LocalizeAsync()
        {
            Location location;
            try
            {
                location = new Location(double.Parse(Stall.Latitude), double.Parse(Stall.Longitude));
                var options = new MapLaunchOptions { NavigationMode = NavigationMode.Driving };
                await Map.OpenAsync(location, options);
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
