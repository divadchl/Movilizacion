using Movilizacion.ViewModels.Messages;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Messages
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class NotificationsListPage : ContentPage
    {
        public NotificationsListPage()
        {
            InitializeComponent();
            BindingContext = new NotificationsListViewModel();
        }
    }
}