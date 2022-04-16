using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.ItemViewModels;
using Deteccion.Services;
using Deteccion.Views.Onboarding;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Onboarding
{
    public class SelectedProcessViewModel : ObservableObject
    {
        #region [ Attributes ]
        private string _code;
        private ApiService _apiService;
        private InvitationItemViewModel _invitationItemViewModel;
        private ICommand _noCommand;
        private ICommand _yesCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public SelectedProcessViewModel(InvitationItemViewModel invitationItemViewModel)
        {
            _apiService = new ApiService();
            _invitationItemViewModel = invitationItemViewModel;
            Init();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string Code 
        { 
            get => _code; 
            set => SetProperty(ref _code, value); 
        }

        public string TitleMessage { get; set; }

        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand NoCommand => _noCommand ?? (_noCommand = new Command(async () => await NoAsync()));
        public ICommand YesCommand => _yesCommand ?? (_yesCommand = new Command(async () => await YesAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private void Init()
        {
            TitleMessage = $"Quieres participar en el proceso{Environment.NewLine}{_invitationItemViewModel.NameProcess}";
        }

        private async Task NoAsync() => await App.Current.MainPage.Navigation.PopAsync();
        private async Task YesAsync()
        {
            if (!await ValidateDataAsync()) return;

            if (!Code.Equals(_invitationItemViewModel.CodeValidation))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(
                    TextStrings.Error, 
                    TextStrings.ErrorEnterCodeValidation, 
                    TextStrings.Accept));
                return;
            }

            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);

            if (_invitationItemViewModel.IdProcess == user.IdProcess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(
                    TextStrings.Warning,
                    "¡Ya estás registrado en el proceso!",
                    TextStrings.Accept));
                return;
            }

            try
            {
                UserDialogs.Instance.ShowLoading(TextStrings.Loading);

                if (Connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    UserDialogs.Instance.HideLoading();
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                    return;
                }

                UpdateProcessRequest updateProcessRequest = new UpdateProcessRequest
                {
                    IdPerson = user.IdPerson,
                    IdProcess = user.IdProcess,
                    IdProcessNew = _invitationItemViewModel.IdProcess,
                    DeviceRegistration = JsonConvert.DeserializeObject<DeviceRegistration>(Preferences.Get(TextStrings.KeyRegistrationDevice, null))
                };

                Response response = await _apiService.PostUpdateProcessAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostUpdateProcess,
                updateProcessRequest);

                UserDialogs.Instance.HideLoading();

                if (!response.IsSuccess)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                    return;
                }

                ProcessResponse processResponse = (ProcessResponse)response.Result;

                user.IdProcess = processResponse.IdProcess;
                user.NameProcess = processResponse.NameProcess;
                Settings.User = JsonConvert.SerializeObject(user);

                await PopupNavigation.Instance.PushAsync(new SimpleDialog(
                    TextStrings.Error, 
                    $"¡Has quedado registrado en el proceso {user.NameProcess}!", 
                    TextStrings.Accept));
                await App.Current.MainPage.Navigation.PushAsync(new ConfirmDataChangePage());
            }
            catch (Exception ex)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
            }
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (string.IsNullOrEmpty(Code))
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(
                    TextStrings.Error, 
                    TextStrings.ErrorEnterCodeValidation, 
                    TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
