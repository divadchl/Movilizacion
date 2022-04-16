using Movilizacion.ItemViewModels;
using Movilizacion.ViewModels.ChatFlow;
using System;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Views.ChatFlow
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class StallDetailPage : ContentPage
    {
        public StallDetailPage(StallItemViewModel stall)
        {
            InitializeComponent();
            BindingContext = new StallDetailViewModel(stall);
        }

        private async void OnClose(object sender, EventArgs e)
        {
            await Navigation.PopAsync();
        }
    }
}