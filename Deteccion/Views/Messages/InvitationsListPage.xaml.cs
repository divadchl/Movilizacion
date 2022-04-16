using Deteccion.ViewModels.Messages;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Messages
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class InvitationsListPage : ContentPage
    {
        public InvitationsListPage()
        {
            InitializeComponent();
            BindingContext = new InvitationsListViewModel();
        }
    }
}