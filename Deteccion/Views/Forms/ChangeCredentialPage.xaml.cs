using Deteccion.ViewModels.Forms;
using Elecciones.Common.Responses;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ChangeCredentialPage : ContentPage
    {
        public ChangeCredentialPage(StateResponse state)
        {
            InitializeComponent();
            BindingContext = new ChangeCredentialViewModel(state);
        }
    }
}