using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Deteccion.Services
{
    public class ApiService
    {
        #region [ Account ]
        public async Task<Response> LoginAsync(string urlBase, string prefix, string controller, LoginRequest model)
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

                UserResponse user = JsonConvert.DeserializeObject<UserResponse>(result);
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

        public async Task<Response> RegisterUserAsync(string urlBase, string prefix, string controller, UserRequest model)
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

                RegisterResponse registerResponse = JsonConvert.DeserializeObject<RegisterResponse>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = registerResponse
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

        public async Task<Response> RegisterPasswordAsync(string urlBase, string prefix, string controller, CodeRequest model)
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

        public async Task<Response> ResendSMSAsync(string urlBase, string prefix, string controller, UserRequest model)
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

                RegisterResponse obj = JsonConvert.DeserializeObject<RegisterResponse>(result);
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

        public async Task<Response> ChangePasswordAsync(string urlBase, string servicePrefix, string controller, ChangePasswordRequest changePasswordRequest)
        {
            try
            {
                string request = JsonConvert.SerializeObject(changePasswordRequest);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
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

        public async Task<Response> VoteResponseAsync(string urlBase, string prefix, string controller, VoteRequest model)
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
        #endregion [ Account ]

        #region [ Credentials ]
        public async Task<Response> PostCredentialAsync(string urlBase, string servicePrefix, string controller, CredentialRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase)
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
                        Message = messageResponse.Message,
                    };
                }

                PersonResponse item = JsonConvert.DeserializeObject<PersonResponse>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = item
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

        public async Task<Response> RegisterAddressAsync(string urlBase, string prefix, string controller, AddressFullRequest model)
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

        public async Task<Response> RegisterAddressINEAsync(string urlBase, string prefix, string controller, AddressINERequest model)
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

        public async Task<Response> ResendCICAsync(string urlBase, string prefix, string controller, ResendCICRequest model)
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
        #endregion [ Credentials ]

        #region [ Guests ]
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

        public async Task<Response> GetPollsAsync(string urlBase, string servicePrefix, string controller, PollsRequest model)
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
                        Message = messageResponse.Message,
                    };
                }

                List<Responses.PollResponse> list = JsonConvert.DeserializeObject<List<Responses.PollResponse>>(result);
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

        public async Task<Response> GetPollAsync(string urlBase, string servicePrefix, string controller, GuidRequest model)
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
                        Message = messageResponse.Message,
                    };
                }

                PollResponse poll= JsonConvert.DeserializeObject<PollResponse>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = poll
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

        public async Task<Response> GetNewsAsync(string urlBase, string servicePrefix, string controller, PersonRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
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

        public async Task<Response> GetNewsItemAsync(string urlBase, string servicePrefix, string controller, GuidRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
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
                        Message = messageResponse.Message,
                    };
                }

                NewsNotification newsItem = JsonConvert.DeserializeObject<NewsNotification>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = newsItem
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

        public async Task<Response> SendPollAsync(string urlBase, string servicePrefix, string controller, SendPollRequest model)
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
                        Message = messageResponse.Message,
                    };
                }

                List<Responses.PollResponse> list = JsonConvert.DeserializeObject<List<Responses.PollResponse>>(result);
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

        public async Task<Response> GetListAsync<T>(
            string urlBase,
            string servicePrefix,
            string controller)
        {
            try
            {
                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri(urlBase),
                };

                string url = $"{servicePrefix}{controller}";
                HttpResponseMessage response = await client.GetAsync(url);
                string result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new Response
                    {
                        IsSuccess = false,
                        Message = result,
                    };
                }

                List<T> list = JsonConvert.DeserializeObject<List<T>>(result);
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

        public async Task<Response> GetNoticePrivacyAsync(string urlBase, string prefix, string controller)
        {
            try
            {
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(urlBase)
                };

                string url = $"{prefix}{controller}";
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

                NoticePrivacyResponse noticePrivacy = JsonConvert.DeserializeObject<NoticePrivacyResponse>(result);
                return new Response
                {
                    IsSuccess = true,
                    Result = noticePrivacy.NoticePrivacy
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

        public async Task<Response> PostExitProcessAsync(string urlBase, string prefix, string controller, UpdateProcessRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
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

                Guid idPreocess = JsonConvert.DeserializeObject<Guid>(result);
                return new Response
                {
                    Result = idPreocess,
                    IsSuccess = true
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

        public async Task<Response> PostGetInvitations(string urlBase, string prefix, string controller, GuidRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
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

                List<GuestPerson> list = JsonConvert.DeserializeObject<List<GuestPerson>>(result);
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

        public async Task<Response> PostUpdateProcessAsync(string urlBase, string prefix, string controller, UpdateProcessRequest model)
        {
            try
            {
                string request = JsonConvert.SerializeObject(model);
                StringContent content = new StringContent(request, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient
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

                ProcessResponse processResponse = JsonConvert.DeserializeObject<ProcessResponse>(result);

                return new Response
                {
                    IsSuccess = true,
                    Result = processResponse
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
    }
}
