using Deteccion.ViewModels.Forms;
using Elecciones.Common.Enums;
using Elecciones.Common.Responses;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class GetCredentialsPage : ContentPage
    {
        public GetCredentialsPage(TypeCredential typeCredential, StateResponse state = null)
        {
            InitializeComponent();
            BindingContext = new GetCredentialsViewModel(typeCredential, state);
        }
    }
}