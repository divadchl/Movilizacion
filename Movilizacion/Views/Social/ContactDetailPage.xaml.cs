using Movilizacion.Models;
using Movilizacion.ViewModels.Social;
using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.Social
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ContactDetailPage : ContentPage
    {
        public ContactDetailPage(Contact contact)
        {
            InitializeComponent();
            BindingContext = new ContactDetailViewModel(contact);
        }

        private async void OnClose(object sender, EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}