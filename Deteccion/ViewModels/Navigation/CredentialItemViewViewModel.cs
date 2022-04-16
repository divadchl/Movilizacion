using Deteccion.Models;
using Deteccion.Views.Forms;
using Elecciones.Common.Enums;
using System.Linq;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion.ViewModels.Navigation
{
    public class CredentialItemViewViewModel : ObservableObject
    {
        #region [ Attributes ]
        private readonly int _credentialId;
        private TypeCredentials _credential;
        private ICommand _selectCredentialCommand;
        private ICommand _nextCommand;
        private ICommand _previousCommand;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public CredentialItemViewViewModel(int credentialId)
        {
            _credentialId = credentialId;
            LoadData();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public TypeCredentials Credential
        {
            get { return _credential; }
            set { SetProperty(ref _credential, value); }
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SelectCredentialCommand => _selectCredentialCommand ?? (_selectCredentialCommand = new Command(SelectCredentialAsync));
        public ICommand NextCommand => _nextCommand ?? (_nextCommand = new Command(Next));
        public ICommand PreviousCommand => _previousCommand ?? (_previousCommand = new Command(Previous));
        #endregion [ Commands ]

        #region [ Methods ]
        private void LoadData()
        {
            Credential = null;

            if (_credentialId != 0)
            {
                Credential = new CredentialsCatalogViewModel()
                    .Credentials.FirstOrDefault(c => c.Id == _credentialId);
            }
        }

        private async void SelectCredentialAsync()
        {
            if(Credential.TypeCredential == TypeCredential.TipoGH)
                await App.Current.MainPage.Navigation.PushAsync(new SelectStatePage(Credential.TypeCredential));
            else
                await App.Current.MainPage.Navigation.PushAsync(new GetCredentialsPage(Credential.TypeCredential));
        }

        private void Next()
        {
            Credential = new CredentialsCatalogViewModel()
                    .Credentials.FirstOrDefault(c => c.Id == Credential.Id + 1);
        }
        private void Previous()
        {
            Credential = new CredentialsCatalogViewModel()
                    .Credentials.FirstOrDefault(c => c.Id == Credential.Id - 1);
        }
        #endregion [ Methods ]
    }
}
