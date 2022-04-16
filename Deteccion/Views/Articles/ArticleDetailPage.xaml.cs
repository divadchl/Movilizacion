using Elecciones.Common.Models;
using Xamarin.Forms;

namespace Deteccion
{
    public partial class ArticleDetailPage : ContentPage
    {
        public ArticleDetailPage() 
            : this(null)
        {
        }

        public ArticleDetailPage(NewsNotification newsNotification)
        {
            InitializeComponent();

            BindingContext = new ArticleDetailViewModel(newsNotification);
        }
    }
}