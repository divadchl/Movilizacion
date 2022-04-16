using Xamarin.Forms;

namespace Deteccion
{
    public partial class ArticlesClassicViewPage : ContentPage
    {
        public ArticlesClassicViewPage()
        {
            InitializeComponent();

            BindingContext = new ArticlesListViewModel();
        }
    }
}
