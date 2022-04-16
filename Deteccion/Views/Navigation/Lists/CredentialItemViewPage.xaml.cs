using Deteccion.Models;
using Deteccion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Navigation.Lists
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class CredentialItemViewPage : ContentPage
    {
        public CredentialItemViewPage()
            : this(null)
        {
        }

        public CredentialItemViewPage(TypeCredentials credential)
        {
            InitializeComponent();
            BindingContext = new CredentialItemViewViewModel(credential.Id);
        }
    }
}