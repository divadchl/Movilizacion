using Deteccion.ViewModels.Forms;
using Elecciones.Common.Models;
using System.Collections.Generic;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Forms
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class SignUpPasswordPage : ContentPage
    {
        public SignUpPasswordPage(string email, string phone, List<GuestPerson> guestPersons)
        {
            InitializeComponent();
            BindingContext = new SignUpPasswordViewModel(email, phone, guestPersons);
        }
    }
}