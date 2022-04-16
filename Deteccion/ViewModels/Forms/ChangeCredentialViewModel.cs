using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Enums;
using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Plugin.Media;
using Plugin.Media.Abstractions;
using Rg.Plugins.Popup.Services;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class ChangeCredentialViewModel : ObservableObject
    {
        #region [ Attributes ]
        private StateResponse _state;
        private FilesHelper _filesHelper;
        private ImageSource _imageFront;
        private ImageSource _imageBack;
        private MediaFile _fileFront;
        private MediaFile _fileBack;
        private ApiService _apiService;
        private ICommand _takePhotoFrontCommand;
        private ICommand _takePhotoBackCommand;
        private ICommand _sendCredentialsCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ChangeCredentialViewModel(StateResponse state)
        {
            _state = state;
            ImageFront = TextStrings.CredentialFrontGH;
            ImageBack = TextStrings.CredentialBackGH;
            _filesHelper = new FilesHelper();
            _apiService = new ApiService();
            PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, TextStrings.InfoTakePhoto, TextStrings.Accept));
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ImageSource ImageFront
        {
            get => _imageFront;
            set => SetProperty(ref _imageFront, value);
        }

        public ImageSource ImageBack
        {
            get => _imageBack;
            set => SetProperty(ref _imageBack, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand TakePhotoFrontCommand => _takePhotoFrontCommand ?? (_takePhotoFrontCommand = new Command(TakePhotoFrontAsync));

        public ICommand TakePhotoBackCommand => _takePhotoBackCommand ?? (_takePhotoBackCommand = new Command(TakePhotoBackAsync));

        public ICommand SendCredentialsCommand => _sendCredentialsCommand ?? (_sendCredentialsCommand = new Command(SendCredentialsAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void TakePhotoFrontAsync()
        {
            var (imageSource, mediaFile) = await GetImage(ImageFront, _fileFront);
            ImageFront = imageSource == null ? TextStrings.CredentialFrontGH : ImageFront = imageSource;
            _fileFront = mediaFile;
        }

        private async void TakePhotoBackAsync()
        {
            var (imageSource, mediaFile) = await GetImage(ImageBack, _fileBack);
            ImageBack = imageSource == null ? TextStrings.CredentialBackGH : imageSource;
            _fileBack = mediaFile;
        }

        private async Task<(ImageSource image, MediaFile file)> GetImage(ImageSource image, MediaFile file)
        {
            try
            {
                image = null;
                file = null;
                await CrossMedia.Current.Initialize();
#if DEBUG
                string source = await Application.Current.MainPage.DisplayActionSheet(
                    TextStrings.WhereTakeImage,
                    TextStrings.Cancel,
                    null,
                    TextStrings.FromGalery,
                    TextStrings.FromCamera);

                if (source == TextStrings.Cancel)
                {
                    file = null;
                    return (image, file);
                }

                if (source == TextStrings.FromCamera)
                {
                    if (!CrossMedia.Current.IsCameraAvailable)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorAccessCamera, TextStrings.Accept));
                        return (image, file);
                    }

                    file = await CrossMedia.Current.TakePhotoAsync(
                        new StoreCameraMediaOptions
                        {
                            Directory = TextStrings.StorageDirectory,
                            Name = TextStrings.StorageImage,
                            PhotoSize = PhotoSize.Small,
                            RotateImage = true
                        }
                    );
                }
                else
                {
                    if (!CrossMedia.Current.IsPickPhotoSupported)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorAccessGalery, TextStrings.Accept));
                        return (image, file);
                    }

                    file = await CrossMedia.Current.PickPhotoAsync();
                }
#else
                if (!CrossMedia.Current.IsCameraAvailable)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorAccessCamera, TextStrings.Accept));
                    return (image, file);
                }

                file = await CrossMedia.Current.TakePhotoAsync(
                    new StoreCameraMediaOptions
                    {
                        Directory = TextStrings.StorageDirectory,
                        Name = TextStrings.StorageImage,
                        PhotoSize = PhotoSize.Small,
                        RotateImage = true
                    }
                );
#endif

                if (file != null)
                {
                    image = ImageSource.FromStream(() =>
                    {
                        Stream stream = file.GetStream();
                        return stream;
                    });
                }
                return (image, file);
            }
            catch (Exception)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPermissionsCamera, TextStrings.Accept));
                return (null, null);
            }
        }

        private async void SendCredentialsAsync()
        {
            if (!await ValidateDataAsync())
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Sending);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            DeviceRegistration deviceRegistration = new DeviceRegistration();
            if (!Preferences.ContainsKey(TextStrings.KeyRegistrationDevice))
            {
                deviceRegistration = null;
            }
            else
            {
                string registrationDevice = Preferences.Get(TextStrings.KeyRegistrationDevice, string.Empty);
                deviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(registrationDevice);
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);

            byte[] imageFrontArray = null;
            byte[] imageBackArray = null;
            imageFrontArray = _fileFront != null ? _filesHelper.ReadFully(_fileFront.GetStream()) : null;
            imageBackArray = _fileBack != null ? _filesHelper.ReadFully(_fileBack.GetStream()) : null;
            
            CredentialRequest credential = new CredentialRequest
            {
                IdPersona = user.IdPerson,
                ImageFront = imageFrontArray,
                ImageBack = imageBackArray,
                TypeCredential = TypeCredential.TipoGH,
                IdPater = new Guid(),
                DeviceRegistration = deviceRegistration,
                User = null,
                State = _state == null ? 0 : _state.IdState
            };

            //=========================================================
            Response responseFront = await _apiService.PostCredentialAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostChangeRecognizerCredential,
                credential);
            
            UserDialogs.Instance.HideLoading();

            if (!responseFront.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, responseFront.Message, TextStrings.Accept));
                return;
            }

            PersonResponse personResponse = (PersonResponse)responseFront.Result;

            bool hasStreet = string.IsNullOrEmpty(personResponse.Calle) ? false : true;
            user.ImageFront = imageFrontArray;
            user.ImageBack = imageBackArray;
            Settings.User = JsonConvert.SerializeObject(user);
            Preferences.Set(TextStrings.KeyIsRegisteredDevice, true);
            await App.Current.MainPage.Navigation.PushAsync(new WalkthroughMinimalPage(hasStreet));
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (ImageFront == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoFront, TextStrings.Accept));
                return false;
            }

            if (ImageFront.ToString().Substring(0, 16).Equals(TextStrings.ValidateCredentialFront.Substring(0, 16)))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoFront, TextStrings.Accept));
                return false;
            }

            if (ImageFront == null && _fileFront == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoFront, TextStrings.Accept));
                return false;
            }

            if (ImageBack == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoBack, TextStrings.Accept));
                return false;
            }

            if (ImageBack.ToString().Substring(0, 16).Equals(TextStrings.ValidateCredentialBack.Substring(0, 16)))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoBack, TextStrings.Accept));
                return false;
            }

            if (ImageBack == null && _fileBack == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorTakePhotoBack, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
