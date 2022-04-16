using Deteccion.ItemViewModels;
using Deteccion.ViewModels.Onboarding;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Onboarding
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class SelectedProcessPage : WalkthroughBasePage
    {
        public SelectedProcessPage(InvitationItemViewModel invitationItemViewModel)
        {
            InitializeComponent();
            BindingContext = new SelectedProcessViewModel(invitationItemViewModel);
        }
    }
}