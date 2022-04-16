using Acr.UserDialogs;
using Deteccion.Business;
using Deteccion.Helpers;
using Deteccion.Services;
using Elecciones.Common.Enums;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Forms
{
    public class ResendCICViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isValidEmision;
        private bool _isValidClaveElector;
        private bool _isValidOCR;
        private bool _isValidCIC;
        private bool _isVisibleTypeC;
        private bool _isVisibleTypeDEFGH;
        private bool _isVisibleImageDEF;
        private bool _isVisibleImageGH;
        private ApiService _apiService;
        private ResendCICRequest _resendCICRequest;
        private ICommand _resendCICCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ResendCICViewModel(string typeCredential)
        {
            _apiService = new ApiService();
            ResendCICRequest = new ResendCICRequest();
            
            if ((int)TypeCredential.TipoC == int.Parse(typeCredential))
            {
                ResendCICRequest.TypeCredential = TypeCredential.TipoC;
                IsVisibleTypeC = true;
            }
            else if ((int)TypeCredential.TipoDEF == int.Parse(typeCredential))
            {
                IsVisibleTypeDEFGH = true;
                IsVisibleImageDEF= true;
                ResendCICRequest.TypeCredential = TypeCredential.TipoDEF;
            }
            else if((int)TypeCredential.TipoGH == int.Parse(typeCredential))
            {
                ResendCICRequest.TypeCredential = TypeCredential.TipoGH;
                IsVisibleTypeDEFGH = true;
                IsVisibleImageGH = true;
            }
        }
        #endregion [ Constructor ]

        #region [ Properties ]

        public bool IsValidEmision
        {
            get => _isValidEmision;
            set => SetProperty(ref _isValidEmision, value);
        }

        public bool IsValidClaveElector
        {
            get => _isValidClaveElector;
            set => SetProperty(ref _isValidClaveElector, value);
        }

        public bool IsValidOCR
        {
            get => _isValidOCR;
            set => SetProperty(ref _isValidOCR, value);
        }

        public bool IsValidCIC
        {
            get => _isValidCIC;
            set => SetProperty(ref _isValidCIC, value);
        }

        public bool IsVisibleTypeC 
        {
            get => _isVisibleTypeC; 
            set => SetProperty(ref _isVisibleTypeC, value); 
        }

        public bool IsVisibleTypeDEFGH
        {
            get => _isVisibleTypeDEFGH;
            set => SetProperty(ref _isVisibleTypeDEFGH, value);
        }

        public bool IsVisibleImageDEF
        {
            get => _isVisibleImageDEF;
            set => SetProperty(ref _isVisibleImageDEF, value);
        }

        public bool IsVisibleImageGH
        {
            get => _isVisibleImageGH;
            set => SetProperty(ref _isVisibleImageGH, value);
        }

        public ResendCICRequest ResendCICRequest
        {
            get => _resendCICRequest;
            set => SetProperty(ref _resendCICRequest, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand ResendCICCommand => _resendCICCommand ?? (_resendCICCommand = new Command(ResendCICAsync));
        #endregion [ Commands ]

        #region [ Methods ]
        private async void ResendCICAsync()
        {
            bool isValid = await ValidateDataAsync();
            if (!isValid)
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Saving);
            UserResponse user = JsonConvert.DeserializeObject<UserResponse>(Settings.User);
            ResendCICRequest.IdPerson = user.IdPerson;

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            Response response = await _apiService.ResendCICAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostResendCIC,
                ResendCICRequest);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorUpdateCIC, TextStrings.Accept));
                return;
            }

            await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoUpdateCIC });
            await App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        }

        private async Task<bool> ValidateDataAsync()
        {
            if ((int)TypeCredential.TipoC == (int)ResendCICRequest.TypeCredential)
            {
                if (!IsValidEmision)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterEmision, TextStrings.Accept));
                    return false;
                }

                if (string.IsNullOrEmpty(ResendCICRequest.NoEmision))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterEmision, TextStrings.Accept));
                    return false;
                }

                if (!IsValidClaveElector)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterClaveElector, TextStrings.Accept));
                    return false;
                }

                if (string.IsNullOrEmpty(ResendCICRequest.ClaveElector))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterClaveElector, TextStrings.Accept));
                    return false;
                }

                if (!IsValidOCR)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterOCR, TextStrings.Accept));
                    return false;
                }

                if (string.IsNullOrEmpty(ResendCICRequest.OCR))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterOCR, TextStrings.Accept));
                    return false;
                }

            }
            else if ((int)TypeCredential.TipoDEF == (int)ResendCICRequest.TypeCredential || (int)TypeCredential.TipoGH == (int)ResendCICRequest.TypeCredential)
            {
                if (!IsValidCIC)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCIC, TextStrings.Accept));
                    return false;
                }

                if (string.IsNullOrEmpty(ResendCICRequest.CIC))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterCIC, TextStrings.Accept));
                    return false;
                }

                if (!IsValidOCR)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterOCR, TextStrings.Accept));
                    return false;
                }

                if (string.IsNullOrEmpty(ResendCICRequest.OCR))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterOCR, TextStrings.Accept));
                    return false;
                }
            }
            
            return true;
        }
        #endregion [ Methods ]
    }
}
