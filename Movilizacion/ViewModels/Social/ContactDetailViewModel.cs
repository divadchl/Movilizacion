using Acr.UserDialogs;
using Elecciones.Common.Helpers;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Movilizacion.Helpers;
using Movilizacion.Services;
using Movilizacion.ViewModels.Navigation;
using Rg.Plugins.Popup.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Input;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.OpenWhatsApp;

namespace Movilizacion.ViewModels.Social
{
    public class ContactDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private string _codeVerification;
        private string _message;
        private string _selectedEmail;
        private string _selectedPhone;
        private bool _isEnabledEmail;
        private bool _isEnabledSMS;
        private ApiService _apiService;
        private ICommand _sendSmsCommand;
        private ICommand _sendEmailCommand;
        private ICommand _whatsAppCommand;
        private ObservableCollection<string> _phones;
        private ObservableCollection<string> _emails;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ContactDetailViewModel(Models.Contact contact)
        {
            Contact = contact;
            _apiService = new ApiService();
            Phones = new ObservableCollection<string>(Contact.PhoneNumbers);
            Emails = new ObservableCollection<string>(Contact.Emails);
            HeightRequestPhones = Phones.Count > 0 ? (Phones.Count * 15 + Phones.Count * 2 * 5) : 25;
            SelectedPhone = Phones.Count > 0 ? Phones[0] : null;
            IsEnabledSMS = Phones.Count > 0 ? true : false;
            HeightRequestEmails = Emails.Count > 0 ? (Emails.Count * 15 + Emails.Count * 2 * 5) : 25;
            SelectedEmail = Emails.Count > 0 ? Emails[0] : null;
            IsEnabledEmail = Emails.Count > 0 ? true : false;
            CreateMessage();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public int HeightRequestPhones { get; set; }

        public int HeightRequestEmails { get; set; }

        public bool IsEnabledEmail
        {
            get => _isEnabledEmail;
            set => SetProperty(ref _isEnabledEmail, value);
        }

        public bool IsEnabledSMS
        {
            get => _isEnabledSMS;
            set => SetProperty(ref _isEnabledSMS, value);
        }

        public Models.Contact Contact { get; }

        public string SelectedEmail
        {
            get => _selectedEmail;
            set => SetProperty(ref _selectedEmail, value);
        }

        public string SelectedPhone
        {
            get => _selectedPhone;
            set => SetProperty(ref _selectedPhone, value);
        }

        public ObservableCollection<string> Phones
        {
            get => _phones;
            set => SetProperty(ref _phones, value);
        }

        public ObservableCollection<string> Emails
        {
            get => _emails;
            set => SetProperty(ref _emails, value);
        }
        #endregion [ Properties ]

        #region [ Commands ]
        public ICommand SendSmsCommand => _sendSmsCommand ?? (_sendSmsCommand = new Command(async () => await SendSmsAsync()));
        public ICommand SendEmailCommand => _sendEmailCommand ?? (_sendEmailCommand = new Command(async () => await SendEmailAsync()));
        public ICommand WhatsAppCommand => _whatsAppCommand ?? (_whatsAppCommand = new Command(async () => await WhatsAppAsync()));
        #endregion [ Commands ]

        #region [ Methods ]
        private async Task SendSmsAsync()
        {
            try
            {
                SelectedPhone = Regex.Replace(SelectedPhone, "[ |(|)|+|-]", string.Empty);
                SelectedPhone = SelectedPhone.Substring(SelectedPhone.Length - 10);
                await Sms.ComposeAsync(new SmsMessage(_message, SelectedPhone));
                await SaveGuest();
            }
            catch (FeatureNotSupportedException ex)
            {
                ProcessException(ex);
            }
            catch (Exception ex)
            {
                if (!ex.Message.StartsWith("Index was out of range"))
                    ProcessException(ex);
            }
        }

        private async Task SendEmailAsync()
        {
            try
            {
                EmailMessage message = new EmailMessage
                {
                    Subject = TextStrings.Subject,
                    Body = _message,
                    To = new List<string>() { SelectedEmail },
                };
                await Email.ComposeAsync(message);
                await SaveGuest();
            }
            catch (FeatureNotSupportedException fbsEx)
            {
                ProcessException(fbsEx);
            }
            catch (Exception ex)
            {
                ProcessException(ex);
            }
        }

        private async Task WhatsAppAsync()
        {
            try
            {
                string phone = string.Empty;
                SelectedPhone = Regex.Replace(SelectedPhone, "[ |(|)|+|-]", string.Empty);
                SelectedPhone = SelectedPhone.Substring(SelectedPhone.Length - 10);
                if (SelectedPhone.Length == 10)
                    phone = $"{TextStrings.CodeContry}{SelectedPhone}";

                var message = HttpUtility.UrlEncode(_message);
                Chat.Open(phone, message);
                await SaveGuest();
            }
            catch (Exception ex)
            {
                ProcessException(ex);
            }
        }

        private async void ProcessException(Exception ex)
        {
            if (ex != null)
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, ex.Message, TextStrings.Accept));
        }

        private async Task SaveGuest()
        {
            UserDialogs.Instance.ShowLoading(TextStrings.Registering);

            if (Connectivity.NetworkAccess != NetworkAccess.Internet)
            {
                UserDialogs.Instance.HideLoading();
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, TextStrings.ConnectionError, TextStrings.Accept));
                return;
            }

            SelectedPhone = Regex.Replace(SelectedPhone, "[ |(|)|+|-]", string.Empty);
            SelectedPhone = SelectedPhone.Substring(SelectedPhone.Length - 10);
            GuestRequest guest = new GuestRequest
            {
                Telefono = SelectedPhone,
                Correo = SelectedEmail,
                Nombre = Contact.Name,
                CodigoInvitacion = _codeVerification,
                IdProceso = App.User.Process.IdProcess,
                App = TextStrings.AppName,
                IdUser = App.User.Id,
            };

            Response response = await _apiService.RegisterGuestAsync(
                Constants.URL_BASE,
                Constants.SERVICE_PREFIX,
                Constants.EndPoints.PostRegisterGuest,
                guest);

            UserDialogs.Instance.HideLoading();

            if (response.IsSuccess)
            {
                if (string.IsNullOrEmpty(response.Message))
                    await PopupNavigation.Instance.PushAsync(new NotificationPopup { Message = TextStrings.InfoRegisterContact });
                else
                    await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Info, response.Message, TextStrings.Accept));

                GuestTabViewModel vm = GuestTabViewModel.GetInstance();
                vm.Contacts.Clear();
                vm.ConfirmedGuests.Clear();
                await vm.LoadDataGuestsAsync();
                await vm.LoadDataConfirmedAsync();

                return;
            }
            else
            {
                await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Warning, response.Message, TextStrings.Accept));
                return;
            }
        }


        private void CreateMessage()
        {
            _codeVerification = new GenerateCode(3).CodeValidation;
            _message = $"Bienvenido a MyDet\n\nSe te está invitando al proceso de: {App.User.Process.Name}\n\nCuando se registre, ingrese el siguiente Código de Activación: {_codeVerification}\n\nDescarga la App para Android\n\nhttps://play.google.com/store/apps/details?id=com.mydecmov.MyDet \n\nDescarga la App para iOS\n\n https://apps.apple.com/us/app/mydet/id1544147053";
        }
        #endregion [ Methods ]
    }
}
