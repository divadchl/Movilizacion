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
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Messages
{
    public class InvitationsListViewModel : ObservableObject
    {
        #region [ Attributes ]
        private bool _isRefreshing;
        
        private ApiService _apiService;
        private static InvitationsListViewModel _instance = null;
        private InvitationItemViewModel _invitation;
        private ObservableCollection<InvitationItemViewModel> _invitations;

        private ICommand _refreshCommand;
        private ICommand _selectedProcessCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public InvitationsListViewModel()
        {
            _apiService = new ApiService();
            _instance = this;
            _ = LoadInvitationsAsync();
        }
        #endregion [ Constructor ]

        #region [ Singleton ]
        public static InvitationsListViewModel Instance()
        {
            if (_instance == null)
                _instance = new InvitationsListViewModel();

            return _instance;
        }
        #endregion[ Singleton ]

        #region [ Properties ]
        public ObservableCollection<InvitationItemViewModel> Invitations
        {
            get => _invitations;
            set => SetProperty(ref _invitations, value);
        }

        public InvitationItemViewModel Invitation
        {
            get => _invitation;
            set => SetProperty(ref _invitation, value);
        }

        public bool IsRefreshing
        {
            get => _isRefreshing;
            set => SetProperty(ref _isRefreshing, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand RefreshCommand => _refreshCommand ?? (_refreshCommand = new Command(async ()=> await RefreshAsync()));
        public ICommand SelectedProcessCommand => _selectedProcessCommand ?? (_selectedProcessCommand = new Command(SelectedProcess));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadInvitationsAsync()
        {
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
                GuidRequest guidRequest = new GuidRequest { Id = user.IdUser };

                Response response = await _apiService.PostGetInvitations(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostGetInvitations,
                guidRequest);

                UserDialogs.Instance.HideLoading();

                if (!response.IsSuccess)
                {
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                    return;
                }

                List<GuestPerson> list = (List<GuestPerson>)response.Result;

                Invitations = new ObservableCollection<InvitationItemViewModel>(list.Select(x => new InvitationItemViewModel
                {
                    IdGuest = x.IdGuest,
                    NameGuest = x.NameGuest,
                    Phone = x.Phone,
                    IdPerson = x.IdPerson,
                    IdUser = x.IdUser,
                    NamePerson = x.NamePerson,
                    CodeValidation = x.CodeValidation,
                    IdProcess = x.IdProcess,
                    NameProcess = x.NameProcess,
                }));
            }
            catch (Exception ex)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
            }
        }

        private async Task RefreshAsync()
        {
            IsRefreshing = true;
            await LoadInvitationsAsync();
            IsRefreshing = false;
        }

        private void SelectedProcess()
        {
            var invitat = Invitation;
            App.Current.MainPage.Navigation.PushAsync(new SelectedProcessPage(Invitation));
        }
        #endregion [ Methods ]
    }
}
