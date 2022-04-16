using Movilizacion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Navigation.Tabs
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class GuestTabPage : ContentPage
    {
        public GuestTabPage()
        {
            InitializeComponent();
            BindingContext = new GuestTabViewModel();
        }
    }
}