
using Movilizacion.ViewModels.Forms;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ChangePasswordPage : ContentPage
    {
        public ChangePasswordPage()
        {
            InitializeComponent();
            BindingContext = new ChangePasswordViewModel();
        }

        private async void OnClose(object sender, System.EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}