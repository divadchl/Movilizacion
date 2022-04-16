using Deteccion.ViewModels.Onboarding;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Onboarding
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ConfirmDataChangePage : WalkthroughBasePage
    {
        public ConfirmDataChangePage()
        {
            InitializeComponent();
            BindingContext = new ConfirmDataChangeViewModel();
        }
    }
}