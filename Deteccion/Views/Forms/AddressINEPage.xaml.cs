using Deteccion.ViewModels.Forms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class AddressINEPage : ContentPage
    {
        public AddressINEPage()
        {
            InitializeComponent();
            BindingContext = new AddressINEViewModel();
        }
    }
}