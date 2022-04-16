using Movilizacion.ViewModels.ChatFlow;
using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.ChatFlow
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PersonDetailPage : ContentPage
    {
        public PersonDetailPage(Guid idPerson)
        {
            InitializeComponent();
            BindingContext = new PersonDetailViewModel(idPerson);
        }

        private async void OnClose(object sender, EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}