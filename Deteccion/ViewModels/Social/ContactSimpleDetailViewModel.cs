using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Deteccion.Views.Forms;
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
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion
{
    public class ContactSimpleDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private UserResponse _user;
        private ImageSource _image;
        private ImageSource _imageFront;
        private ImageSource _imageBack;
        private FilesHelper _filesHelper;
        private MediaFile _file;
        private readonly ApiService _apiService;
        private ICommand _changeImageCommand;
        private ICommand _changePasswordCommand;
        private ICommand _changeCredentialCommand;
        private ICommand _closeCommand;
        private ICommand _exitProcessCommand;
        private ICommand _logoutCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ContactSimpleDetailViewModel()
        {
            _apiService = new ApiService();
            _filesHelper = new FilesHelper();
            LoadUser();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ImageSource Image
        {
            get => _image;
            set => SetProperty(ref _image, value);
        }

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

        public UserResponse User
        {
            get => _user;
            set => SetProperty(ref _user, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]

        public ICommand ChangeImageCommand => _changeImageCommand ?? (_changeImageCommand = new Command(ChangeImageAsync));

        public ICommand ChangePasswordCommand => _changePasswordCommand ?? (_changePasswordCommand = new Command(ChangePasswordAsync));
        
        public ICommand ChangeCredentialCommand => _changeCredentialCommand ?? (_changeCredentialCommand = new Command(ChangeCredentialAsync));

        public ICommand CloseCommand => _closeCommand ?? (_closeCommand = new Command(CloseAsync));
        public ICommand ExitProcessCommand => _exitProcessCommand ?? (_exitProcessCommand = new Command(ExitProcessAsync));
        public ICommand LogoutCommand => _logoutCommand ?? (_logoutCommand = new Command(LogoutAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void ChangeImageAsync()
        {
            try
            {
                await CrossMedia.Current.Initialize();

                string source = await Application.Current.MainPage.DisplayActionSheet(
                    TextStrings.WhereTakeImage,
                    TextStrings.Cancel,
                    null,
                    TextStrings.FromGalery,
                    TextStrings.FromCamera);

                if (source == TextStrings.Cancel)
                {
                    _file = null;
                    return;
                }

                if (source == TextStrings.FromCamera)
                {
                    if (!CrossMedia.Current.IsCameraAvailable)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorAccessCamera, TextStrings.Accept));
                        return;
                    }

                    _file = await CrossMedia.Current.TakePhotoAsync(
                        new StoreCameraMediaOptions
                        {
                            Directory = TextStrings.StorageDirectory,
                            Name = TextStrings.StorageImage,
                            PhotoSize = PhotoSize.Medium,
                        }
                    );
                }
                else if (source == TextStrings.FromGalery)
                {
                    if (!CrossMedia.Current.IsPickPhotoSupported)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorAccessGalery, TextStrings.Accept));
                        return;
                    }

                    _file = await CrossMedia.Current.PickPhotoAsync();
                }
                else
                {
                    _file = null;
                    return;
                }

                if (_file != null)
                {
                    Image = ImageSource.FromStream(() =>
                    {
                        System.IO.Stream stream = _file.GetStream();
                        Settings.ImageProfile = _filesHelper.ImageToString(stream);
                        return stream;
                    });
                }
            }
            catch (Exception)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPermissionsCamera, TextStrings.Accept));
            }
        }

        private async void ChangePasswordAsync() => await App.Current.MainPage.Navigation.PushAsync(new ChangePasswordPage());

        private async void ChangeCredentialAsync() => await App.Current.MainPage.Navigation.PushAsync(new SelectStatePage(TypeCredential.None));

        private async void CloseAsync() => await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());

        private async void ExitProcessAsync()
        {
            bool result = await App.Current.MainPage.DisplayAlert(
                TextStrings.Info, "¿Estás seguro de salir del proceso?", 
                TextStrings.Accept, 
                TextStrings.Cancel);

            if (!result) return;

            try
            {
                UserDialogs.Instance.ShowLoading(TextStrings.Loading);

                if (Connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    UserDialogs.Instance.HideLoading();
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                    return;
                }

                UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
                UpdateProcessRequest updateProcessRequest = new UpdateProcessRequest
                { 
                    IdPerson = user.IdPerson,
                    IdProcess = user.IdProcess,
                     DeviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, null))
                };

                Response response = await _apiService.PostExitProcessAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostExitProcess,
                updateProcessRequest);

                UserDialogs.Instance.HideLoading();

                if (!response.IsSuccess)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                    return;
                }

                string nameProcess = user.NameProcess;
                user.IdProcess = (Guid)response.Result;
                user.NameProcess = string.Empty;

                Settings.User = JsonConvert.SerializeObject(user);
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, $"¡Has quedado fuera del proceso {nameProcess}!", TextStrings.Accept));
            }
            catch (Exception ex)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
            }
        }

        private async void LogoutAsync(object obj)
        {
            Settings.IsLogin = false;
            Settings.User = string.Empty;
            await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }

        private void LoadUser()
        {
            if (!string.IsNullOrEmpty(Settings.ImageProfile))
            {
                Image = ImageSource.FromStream(() =>
                {
                    return _filesHelper.StringToImage(Settings.ImageProfile);
                });
            }
            else
            {
                Image = TextStrings.NoImage;
            }

            User = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            ImageFront = ImageSource.FromStream(() =>
            {
                return _filesHelper.ArrayToImage(User.ImageFront);
            });
            ImageBack = ImageSource.FromStream(() =>
            {
                return _filesHelper.ArrayToImage(User.ImageBack);
            });
        }
        #endregion [ Methods ]
    }
}
