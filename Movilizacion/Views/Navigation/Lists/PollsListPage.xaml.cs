using Movilizacion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Navigation.Lists
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PollsListPage : ContentPage
    {
        public PollsListPage()
        {
            InitializeComponent();
            BindingContext = new PollsListViewModel();
        }
    }
}