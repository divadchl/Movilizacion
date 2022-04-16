using Movilizacion.ViewModels.TasksFlow;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.TasksFlow
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class GraphicsPage : ContentPage
    {
        public GraphicsPage()
        {
            InitializeComponent();
            BindingContext = new GraphicsViewModel();
        }
    }
}