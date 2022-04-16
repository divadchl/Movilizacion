using Deteccion.ViewModels.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Navigation.Lists
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class CredentialsCarouselPage : CarouselPage
    {
        public CredentialsCarouselPage()
        {
            InitializeComponent();

            var model = new CredentialsCatalogViewModel();
            
            for (var i = 0; i < model.Credentials.Count; i++)
            {
                Children.Add(new CredentialItemViewPage(model.Credentials[i]));
            }
        }
    }
}