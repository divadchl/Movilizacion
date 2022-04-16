using Newtonsoft.Json;
using System;
using System.Net.Http;

namespace Elecciones.Logic.Services
{
    public class SMSService
    {
        private const string userName = "oscar.salas";
        private const string password = "AZThZ6SJv5pUBgQQ";
        public SMSResponse Send_SMS(string number, string message)
        {
            SMSResponse result = new SMSResponse();
            var client = new HttpClient();
            var request = string.Format("http://api.c3ntrosms.com:8181?username={0}&password={1}&number={2}&message={3}", userName, password, number, message);

            var response = client.GetAsync(request).Result;
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    string data = response.Content.ReadAsStringAsync().Result;
                    result = JsonConvert.DeserializeObject<SMSResponse>(data);
                }
                catch (Exception ex)
                {
                    result.success = false;
                    result.descripcion = ex.Message;
                }
            }
            return result;
        }

        public class SMSResponse
        {
            public bool success { get; set; }
            public int code { get; set; }
            public string descripcion { get; set; }
            public string id { get; set; }
        }
    }
}
