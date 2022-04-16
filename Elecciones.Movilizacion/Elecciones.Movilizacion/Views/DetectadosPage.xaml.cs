using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;  

using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using Elecciones.Movilizacion.Models;

namespace Elecciones.Movilizacion.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DetectadosPage : ContentPage
    {
 
        public DetectadosPage()
        {
            InitializeComponent();
            FillDetected();
        }

        private async void FillDetected()
        {
            var request = new HttpRequestMessage();
            request.RequestUri = new Uri("http://192.168.100.53:45455/api/Detectados");
            request.Method = HttpMethod.Get;
            request.Headers.Add("Acept", "application/json");
            var client = new HttpClient();
            HttpResponseMessage response = await client.SendAsync(request);
            if(response.StatusCode == HttpStatusCode.OK)
            {
                string content = await response.Content.ReadAsStringAsync();
                var resultado = JsonConvert.DeserializeObject<List<Personas>>(content);

                MyListView.ItemsSource = resultado;
            }
        }

    }
}