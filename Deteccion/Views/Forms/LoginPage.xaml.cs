using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Deteccion.ViewModels.Forms;

namespace Deteccion
{
    public partial class LoginPage : ContentPage
    {
        public LoginPage()
        {
            InitializeComponent();
            BindingContext = new LoginViewModel();
        }
    }
}