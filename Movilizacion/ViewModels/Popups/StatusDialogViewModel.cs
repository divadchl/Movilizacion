using Acr.UserDialogs;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.ItemViewModels;
using Movilizacion.Services;
using Movilizacion.ViewModels.ChatFlow;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Popups
{
    public class StatusDialogViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isEnabled;
        private string _remark;
        private TimeSpan _time;
        private StallItemViewModel _stall;
        private ApiService _apiService;
        private ObservableCollection<StatusStallResponse> _statusStalls;
        private StatusStallResponse _selectedStatusStall;
        private ICommand _saveCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public StatusDialogViewModel(StallItemViewModel stall)
        {
            _stall = stall;
            _apiService = new ApiService();
            Time = DateTime.Now.TimeOfDay;
            _ = LoadStatusStall();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ObservableCollection<StatusStallResponse> StatusStalls
        {
            get => _statusStalls;
            set => SetProperty(ref _statusStalls, value);
        }

        public StatusStallResponse SelectedStatusStall
        {
            get => _selectedStatusStall;
            set
            {
                SetProperty(ref _selectedStatusStall, value);
                IsEnabled = _selectedStatusStall.IdStatus == 3 ? true : false;
                Remark = _selectedStatusStall.IdStatus != 3 ? string.Empty : string.Empty;
            }
        }

        public string Remark 
        { 
            get => _remark; 
            set => SetProperty(ref _remark, value); 
        }

        public TimeSpan Time
        {
            get => _time;
            set => SetProperty(ref _time, value);
        }

        public bool IsEnabled
        { 
            get => _isEnabled; 
            set => SetProperty(ref _isEnabled, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SaveCommand => _saveCommand ?? (_saveCommand = new Command(async () => await SaveAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadStatusStall()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Saving);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetStatusStallAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetStatusStall,
                token.AccessToken);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            List<StatusStallResponse> listResponse = response.Result as List<StatusStallResponse>;

            StatusStalls = new ObservableCollection<StatusStallResponse>(listResponse);
            //SelectedStatusStall = StatusStall.Where(s => s.Status.Equals(_stall..Contact.TipoContacto)).FirstOrDefault();
        }

        private async Task SaveAsync()
        {
            if (!await ValidateDataAsync())
                return;

            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            ReportStallRequest reportStall = new ReportStallRequest
            {
                IdStall = _stall.IdStall,
                IdProcess = App.User.Process.IdProcess,
                IdStatusStall = SelectedStatusStall.IdStatus,
                DateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, Time.Hours, Time.Minutes, Time.Seconds),
                Remark = Remark,
                User = App.User.UserName
            };

            Response response = await _apiService.SaveReportStall(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostReportStall,
                reportStall,
                token.AccessToken);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            await StallsTabbedViewModel.GetInstance().LoadStallsAsync();

            await PopupNavigation.Instance.PopAsync();
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (SelectedStatusStall == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorSelectStatusStall, TextStrings.Accept));
                return false;
            }

            if(SelectedStatusStall.IdStatus == 3)
            {
                if(string.IsNullOrEmpty(Remark) || string.IsNullOrWhiteSpace(Remark))
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorEnterRemark, TextStrings.Accept));
                    return false;
                }
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
