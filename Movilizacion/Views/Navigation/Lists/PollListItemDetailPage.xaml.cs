using Elecciones.Common.Responses;
using Movilizacion.ViewModels.Navigation;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Navigation.Lists
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PollListItemDetailPage : ContentPage
    {
        public PollListItemDetailPage(QuestionPercent question)
        {
            InitializeComponent();
            BindingContext = new PollListItemDetailViewModel(question);
        }
    }
}