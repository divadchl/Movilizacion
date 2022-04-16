using Deteccion.ViewModels.Forms;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ResendCICPage : ContentPage
    {
        public ResendCICPage(string typeCredential)
        {
            InitializeComponent();
            BindingContext = new ResendCICViewModel(typeCredential);
        }
    }
}