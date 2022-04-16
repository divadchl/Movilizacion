using System;
using Xamarin.Essentials;
using Xamarin.Forms;
using UXDivers.Grial;
using Xamarin.Forms.OpenWhatsApp;

namespace Movilizacion
{
    public partial class ContactSimpleDetailPage : ContentPage
    {
        private Detectados detectados;
        public ContactSimpleDetailPage(Detectados detectados)
        {
            InitializeComponent();
            this.detectados = detectados;
            BindingContext = detectados;

            
        }

        private void LlamarContaco_Clicked(object sender, EventArgs e)
        {
            try
            {
                PhoneDialer.Open(txtNumero.Text);
            }
            catch (Exception ex)
            {

                DisplayAlert("No se puede realizar la llamada", "Inténtelo mas tarde", "Ok");
            }
        }

        private async  void Ubicacion_Clicked(object sender, EventArgs e)
        {
            if (Device.RuntimePlatform == Device.iOS)
            {
                // https://developer.apple.com/library/ios/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
                await Launcher.OpenAsync("http://maps.apple.com/?daddr=San+Francisco,+CA&saddr=cupertino");
            }
            else if (Device.RuntimePlatform == Device.Android)
            {
                double latitud = 40.765819;
                double longitud = -73.975866;
                string placeName = "Home";

                var supportsUri = await Launcher.CanOpenAsync("comgooglemaps://");

                if (supportsUri)
                    await Launcher.OpenAsync($"comgooglemaps://?q={latitud},{longitud}({placeName})");
                else
                    await Map.OpenAsync(40.765819, -73.975866, new MapLaunchOptions { Name = "Test" });
            }
            else if (Device.RuntimePlatform == Device.UWP)
            {
                await Launcher.OpenAsync("bingmaps:?rtp=adr.394 Pacific Ave San Francisco CA~adr.One Microsoft Way Redmond WA 98052");
            }
        }

        private async void EnviaWhatsApp_Clicked(object sender, EventArgs e)
        {

            try
            {
                Chat.Open(txtNumero.Text, null);
            }
            catch (Exception ex)
            {
                await DisplayAlert("Error", "No se encontro WhatsApp", "OK");
            }
        }



        //private async void OnEdit(object sender, EventArgs e)
        //{
        //    await DisplayAlert("Edit tapped", "Navigate to the edit contact page.", Resx.AppResources.StringOK);
        //}

        //private async void OnClose(object sender, System.EventArgs e)
        //{
        //    await Navigation.PopModalAsync();
        //}
    }
}