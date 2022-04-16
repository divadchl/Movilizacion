using Deteccion.Responses;
using Deteccion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Navigation.Lists
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PollListItemPage : ContentPage
    {
        public PollListItemPage(PollResponse poll)
        {
            InitializeComponent();
            BindingContext = new PollListItemViewModel(poll);
        }
    }
}