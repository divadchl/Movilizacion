using Deteccion.ViewModels.Forms;
using Elecciones.Common.Enums;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class SelectStatePage : ContentPage
    {
        public SelectStatePage(TypeCredential typeCredential)
        {
            InitializeComponent();
            BindingContext = new SelectStateViewModel(typeCredential);
        }
    }
}