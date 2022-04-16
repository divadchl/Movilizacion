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
    public partial class ChangePasswordPage : ContentPage
    {
        public ChangePasswordPage()
        {
            InitializeComponent();
            BindingContext = new ChangePasswordViewModel();
        }

        private async void OnClose(object sender, System.EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}