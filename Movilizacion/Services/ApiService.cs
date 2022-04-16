using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Movilizacion.Business;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Movilizacion.Services
{
    public class ApiService
    {
        #region [ Account ]

        public async Task<(TokenResponse token, string errorMessage)> GetToken(string urlBase, string username, string password)
        {
            try
            {
                var loginData = new Dictionary<string, string>
                {
                    {"UserName", username},
                    {"Password", password},
                    {"grant_type", "password"}
                };

                FormUrlEncodedContent content = new FormUrlEncodedContent(loginData);

                HttpClient client = new HttpClient();
                client.BaseAddress = new Uri(urlBase);
                HttpResponseMessage response = await client.PostAsync("Token", content);
                string resultJSON = await response.Content.ReadAsStringAsync();
                TokenResponse result = JsonConvert.DeserializeObject<TokenResponse>(resultJSON);
                return (result, "");
            }
            catch(Exception ex)
            {
                return (null, ex.Message);
            }
        }
        public async Task<Response> LoginAsync(string urlBase, string prefix, string controller, UserNameRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{prefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                UserMovResponse user = JsonConvert.DeserializeObject<UserMovResponse>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = user
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> RecoveryPasswordAsync(string urlBase, string prefix, string controller, EmailRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
                };

                string url = $"{prefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message
                    };
                }

                var obj = JsonConvert.DeserializeObject(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = obj
                };

            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> ChangePasswordAsync(string urlBase, string servicePrefix, string controller, ChangePasswordRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                Response obj = JsonConvert.DeserializeObject<Response>(result);
                return obj;
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
        #endregion [ Account ]

        public async Task<Response> GetPersonsAsync(string urlBase, string servicePrefix, string controller, PersonMovRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                PersonsResponse list = JsonConvert.DeserializeObject<PersonsResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetPersonAsync(string urlBase, string servicePrefix, string controller, PersonRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                PersonDetailResponse person = JsonConvert.DeserializeObject<PersonDetailResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = person
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetPollsMovilizacionAsync(string urlBase, string servicePrefix, string controller, PersonMovRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };
                
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                List<PollResponse> list = JsonConvert.DeserializeObject<List<PollResponse>>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetPollPercentAsync(string urlBase, string servicePrefix, string controller, string accessToken)
        {
            try
            {
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.GetAsync(url);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                PollPercentResponse list = JsonConvert.DeserializeObject<PollPercentResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetNewsAsync(string urlBase, string servicePrefix, string controller, PersonMovRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                List<NewsNotification> list = JsonConvert.DeserializeObject<List<NewsNotification>>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetActionsAsync(string urlBase, string servicePrefix, string controller, string accessToken)
        {
            try
            {
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase),
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.GetAsync(url);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                List<ActionModel> list = JsonConvert.DeserializeObject<List<ActionModel>>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> SaveContactedPerson(string urlBase, string servicePrefix, string controller, PersonContactedRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                //PersonDetailResponse person = JsonConvert.DeserializeObject<PersonDetailResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                   // Result = person
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetGraphicsAsync(string urlBase, string servicePrefix, string controller, PersonMovRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                GraphicsResponse person = JsonConvert.DeserializeObject<GraphicsResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = person
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetStatusStallAsync(string urlBase, string servicePrefix, string controller, string accessToken)
        {
            try
            {
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase),
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.GetAsync(url);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                List<StatusStallResponse> list = JsonConvert.DeserializeObject<List<StatusStallResponse>>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> SaveReportStall(string urlBase, string servicePrefix, string controller, ReportStallRequest model, string accessToken)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
                };

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Constants.TOKENTYPE, accessToken);
                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                return new Response
                {
                    IsSuccess = true,
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        #region [ Guests ]
        public async Task<Response> GetListGuestNotConfirmAsync(string urlBase, string prefix, string controller, PersonRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
                };

                string url = $"{prefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message,
                    };
                }

                List<GuestsResponse> list = JsonConvert.DeserializeObject<List<GuestsResponse>>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> GetListGuestConfirmAsync(string urlBase, string servicePrefix, string controller, PersonRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase),
                };

                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    MessageResponse messageResponse = JsonConvert.DeserializeObject<MessageResponse>(result);
                    return new Response
                    {
                        IsSuccess = false,
                        Message = messageResponse.Message
                    };
                }

                List<GuestsResponse> list = JsonConvert.DeserializeObject<List<GuestsResponse>>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = list
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<Response> RegisterGuestAsync(string urlBase, string prefix, string controller, GuestRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
                };

                string url = $"{prefix}{controller}";
                HttpResponseMessage response = await client.PostAsync(url, content);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new Response
                    {
                        IsSuccess = false,
                        Message = result,
                    };
                }

                return new Response { IsSuccess = true };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }
        #endregion [ Guests ]
    }
}
