using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Deteccion.ViewModels.Forms;

namespace Deteccion
{
    public partial class SignUpPage : ContentPage
    {
        public SignUpPage()
        {
            InitializeComponent();
            BindingContext = new SignUpViewModel();
        }

        private async void OnLoginTapped(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new LoginPage());
        }
    }
}