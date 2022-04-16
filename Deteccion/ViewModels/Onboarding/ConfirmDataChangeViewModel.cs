using Deteccion.Helpers;
using Deteccion.Views.Forms;
using Elecciones.Common.Enums;
using Elecciones.Common.Helpers;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Onboarding
{
    public class ConfirmDataChangeViewModel : ObservableObject
    {
        #region [ Attributes ]
        private FilesHelper _filesHelper;
        private ImageSource _imageFront;

        private ICommand _noCommand;
        private ICommand _yesCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ConfirmDataChangeViewModel()
        {
            Init();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string TitleMessage { get; set; }

        public ImageSource ImageFront
        {
            get => _imageFront;
            set => SetProperty(ref _imageFront, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand NoCommand => _noCommand ?? (_noCommand = new Command(async () => await NoAsync()));
        public ICommand YesCommand => _yesCommand ?? (_yesCommand = new Command(async () => await YesAsync()));

        #endregion [ Commands ]

        #region [ Methods ]
        private void Init()
        {
            _filesHelper = new FilesHelper();
            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            TitleMessage = $"Bienvenido al proceso{Environment.NewLine}{user.NameProcess}";

            ImageFront = ImageSource.FromStream(() =>
            {
                return _filesHelper.ArrayToImage(user.ImageFront);
            });
        }

        private async Task NoAsync() => await App.Current.MainPage.Navigation.PushAsync(new SelectStatePage(TypeCredential.None));
        private async Task YesAsync() => await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        #endregion
    }
}
