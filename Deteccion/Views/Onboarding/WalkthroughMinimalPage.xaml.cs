using UXDivers.Grial;
namespace Deteccion
{
    public partial class WalkthroughMinimalPage : WalkthroughBasePage
    {
        public WalkthroughMinimalPage(bool hasStreet)
        {
            InitializeComponent();

            BindingContext = new WalkthroughViewModel(hasStreet);
        }
    }
}