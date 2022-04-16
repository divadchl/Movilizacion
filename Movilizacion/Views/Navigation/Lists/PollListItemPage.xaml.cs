using Elecciones.Common.Responses;
using Movilizacion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Navigation.Lists
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