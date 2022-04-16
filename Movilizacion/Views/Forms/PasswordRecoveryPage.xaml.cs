using Movilizacion.ViewModels.Forms;
using Xamarin.Forms;

namespace Movilizacion
{
    public partial class PasswordRecoveryPage : ContentPage
    {
        public PasswordRecoveryPage()
        {
            InitializeComponent();
            BindingContext = new PasswordRecoveryViewModel();
        }
    }
}