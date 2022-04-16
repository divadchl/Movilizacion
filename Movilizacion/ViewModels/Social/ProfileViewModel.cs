using Elecciones.Common.Helpers;
using Elecciones.Common.Responses;
using Movilizacion.Helpers;
using Movilizacion.Views.Forms;
using Newtonsoft.Json;
using Plugin.Media;
using Plugin.Media.Abstractions;
using Rg.Plugins.Popup.Services;
using System;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Social
{
    public class ProfileViewModel : ObservableObject
    {
        #region [ Attributes ]
        private UserMovResponse _user;
        private ImageSource _image;
        private FilesHelper _filesHelper;
        private MediaFile _file;
        private ICommand _logoutCommand;
        private ICommand _changeImageCommand;
        private ICommand _changePasswordCommand;
        private ICommand _closeCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ProfileViewModel()
        {
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

        public UserMovResponse User
        {
            get => _user;
            set => SetProperty(ref _user, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand LogoutCommand => _logoutCommand ?? (_logoutCommand = new Command(LogoutAsync));

        public ICommand ChangeImageCommand => _changeImageCommand ?? (_changeImageCommand = new Command(ChangeImageAsync));

        public ICommand ChangePasswordCommand => _changePasswordCommand ?? (_changePasswordCommand = new Command(ChangePasswordAsync));

        public ICommand CloseCommand => _closeCommand ?? (_closeCommand = new Command(CloseAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void LogoutAsync(object obj)
        {
            Preferences.Set(TextStrings.KeyIsLogin, false);
            Preferences.Set(TextStrings.KeyToken, string.Empty);
            await App.Current.MainPage.Navigation.PushAsync(new LoginPage());
        }

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
                        Preferences.Set(TextStrings.KeyImageProfile, _filesHelper.ImageToString(stream));
                        return stream;
                    });
                }
            }
            catch (Exception)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorPermissionsCamera, TextStrings.Accept));
            }
            
        }

        private async void ChangePasswordAsync()
        {
            await App.Current.MainPage.Navigation.PushAsync(new ChangePasswordPage());
        }

        private void LoadUser()
        {
            if (Preferences.ContainsKey(TextStrings.KeyImageProfile))
            {
                Image = ImageSource.FromStream(() =>
                {
                    return _filesHelper.StringToImage(Preferences.Get(TextStrings.KeyImageProfile, string.Empty));
                });
            }
            else
            {
                Image = TextStrings.NoImage;
            }

            User = JsonConvert.DeserializeObject<UserMovResponse>(Preferences.Get(TextStrings.KeyUser, string.Empty));
        }

        private async void CloseAsync()
        {
            await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        }
        #endregion [ Methods ]
    }
}
