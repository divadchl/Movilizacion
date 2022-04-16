using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Movilizacion.ViewModels.Forms;

namespace Movilizacion
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