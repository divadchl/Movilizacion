using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Deteccion.ViewModels.Forms;

namespace Deteccion
{
    public partial class PasswordRecoveryPage : ContentPage
    {
        public PasswordRecoveryPage()
        {
            InitializeComponent();
            BindingContext = new PasswordRecoveryViewModel();
        }
    }
}