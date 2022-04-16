using Deteccion.ViewModels.Onboarding;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Onboarding
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class VotePage : WalkthroughBasePage
    {
        public VotePage()
        {
            InitializeComponent();
            BindingContext = new VoteViewModel();
        }
    }
}