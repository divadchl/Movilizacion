using Deteccion.Models;
using Deteccion.ViewModels.Social;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Social
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ContactDetailPage : ContentPage
    {
        public ContactDetailPage(Contact contact)
        {
            InitializeComponent();
            BindingContext = new ContactDetailViewModel(contact);
        }

        private async void OnClose(object sender, System.EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}