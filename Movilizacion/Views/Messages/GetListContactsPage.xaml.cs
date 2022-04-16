using Movilizacion.ViewModels.Messages;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Messages
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class GetListContactsPage : ContentPage
    {
        public GetListContactsPage()
        {
            InitializeComponent();
            BindingContext = new GetListContactsViewModel();
        }
    }
}