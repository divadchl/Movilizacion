using Elecciones.Common.Models;
using Movilizacion.ViewModels.Articles;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Articles
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class NewsDetailPage : ContentPage
    {
        public NewsDetailPage()
            :this(null)
        {

        }

        public NewsDetailPage(NewsNotification newsNotification)
        {
            InitializeComponent();
            BindingContext = new NewsDetailViewModel(newsNotification);
        }
    }
}