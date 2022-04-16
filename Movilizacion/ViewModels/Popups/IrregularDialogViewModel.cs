using Acr.UserDialogs;
using Elecciones.Common.Models;
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
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Movilizacion.ViewModels.Popups
{
    public class IrregularDialogViewModel : ObservableObject
    {
        #region [ Attributes ]
        private PersonItemViewModel _person;
        private ApiService _apiService;
        private ObservableCollection<ActionModel> _actions;
        private ActionModel _selectedAction;
        private ICommand _selectCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public IrregularDialogViewModel(PersonItemViewModel person)
        {
            _person = person;
            _apiService = new ApiService();
            _ = LoadActions();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ObservableCollection<ActionModel> Actions 
        { 
            get => _actions; 
            set => SetProperty(ref _actions, value); 
        }

        public ActionModel SelectedAction 
        { 
            get => _selectedAction; 
            set => SetProperty(ref _selectedAction, value); 
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SelectCommand => _selectCommand ?? (_selectCommand = new Command(async () => await SelectAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task LoadActions()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Loading);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            TokenResponse token = JsonConvert.DeserializeObject<TokenResponse>(Preferences.Get(TextStrings.KeyToken, string.Empty));

            Response response = await _apiService.GetActionsAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.GetActions,
                token.AccessToken);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            List<ActionModel> listResponse = response.Result as List<ActionModel>;
            
            Actions = new ObservableCollection<ActionModel>(listResponse);
            SelectedAction = Actions.Where(a => a.TypeContact.Equals(_person.Contact.TipoContacto)).FirstOrDefault();
        }

        private async Task SelectAsync()
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

            PersonContactedRequest personContacted = new PersonContactedRequest
            {
                IdPerson = _person.IdPersona,
                IdProces = App.User.Process.IdProcess,
                IdTypeContact = SelectedAction.IdTypeContact,
                User = App.User.UserName,
                DateTime = DateTime.Now
            };

            Response response = await _apiService.SaveContactedPerson(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostContactedPerson,
                personContacted,
                token.AccessToken);

            UserDialogs.Instance.HideLoading();

            if (!response.IsSuccess)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }

            await PersonsTabbedViewModel.GetInstance().LoadPersonsUsersAsync();

            await PopupNavigation.Instance.PopAsync();
        }

        private async Task<bool> ValidateDataAsync()
        {
            if (SelectedAction == null)
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ErrorSelectContacted, TextStrings.Accept));
                return false;
            }

            return true;
        }
        #endregion [ Methods ]
    }
}
