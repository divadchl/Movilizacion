using Elecciones.Common.Models;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.Services;
using Elecciones.Models.DBSMovilizacion;
using Microsoft.Azure.NotificationHubs;
using OpenGraphNet;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/notifications")]
    public class NotificationsController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();

        #region [Deteccion ]
        [HttpGet]
        [Route("sendnotificationandroiddeteccionnotice")]
        public async Task<IHttpActionResult> SendNotificationAndroidDeteccionNotice(string tag1)
        {
            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "Aviso";
            notificationPush.Notification.Title = "Aviso";
            notificationPush.Notification.Body = "Te recuerdo ir a votar este 1 de julio";
            string[] tags = new string[] { tag1 };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);
            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationandroiddeteccionnoticevote")]
        public async Task<IHttpActionResult> SendNotificationAndroidDeteccionNoticeVote(string tag1)
        {
            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "AvisoVotar";
            notificationPush.Notification.Title = "Te recuerdo ir a votar en este día";
            notificationPush.Notification.Body = "El cuerpo de la notificacion para rrecordarles que hay que ir a votar el día de la eleccion. El cuerpo de la notificacion para rrecordarles que hay que ir a votar el día de la eleccion";
            string[] tags = new string[] { tag1 };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);
            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationandroiddeteccionnoticevalidationcredential")]
        public async Task<IHttpActionResult> SendNotificationAndroidDeteccionNoticeValidationCredential(string tag1, string typeCredential)
        {
            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "ValidacionCredencial";
            notificationPush.Notification.Title = "Aviso importante acerca de tu credencial";
            notificationPush.Notification.Body = "Tu credencial no es válida por lo que es necesario que envíes nuevamente ciertos datos";
            notificationPush.Data.Value = typeCredential;
            string[] tags = new string[] { tag1 };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);
            return Ok();
        }

        [HttpGet]
        [Route("SendNotificationiosdeteccionnotice")]
        public async Task<IHttpActionResult> SendNotificationiOSDeteccionNotice(string tag1)
        {
            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = "Título de la notificación\nOtro renglon de la notificación",
                    Parameters = new Parameters
                    {
                        Title = "Título de la notificación\nMás información acerca de la notificación",
                        Body = $"El cuerpo de la notificación es este texto que puede ser bastante largo para poder probar como se ven en la notificaciones {tag1}",
                        Tag = "Aviso",
                        Id = "04F238E2-50B2-4C4D-96EE-9B11F39A91B1",
                    }
                }
            };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);
            return Ok();
        }

        [HttpGet]
        [Route("SendNotificationiosdeteccionnoticevote")]
        public async Task<IHttpActionResult> SendNotificationiOSDeteccionNoticeVote(string tag1)
        {
            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = "Recordatorio de ir a votar",
                    Parameters = new Parameters
                    {
                        Title = "Recordatorio de ir a votar",
                        Body = $"Cuerpo de la notificación del recordatorio de ir a votar en este día {tag1}",
                        Tag = "AvisoVotar",
                        Id = string.Empty,
                    }
                }
            };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);
            return Ok();
        }

        [HttpGet]
        [Route("SendNotificationiosdeteccionnoticevalidationcredential")]
        public async Task<IHttpActionResult> SendNotificationiOSDeteccionNoticeValidationCredential(string tag1, string typeCredential)
        {
            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = "Aviso importante acerca de tu credencial",
                    Parameters = new Parameters
                    {
                        Title = "Titulo Validacion de la credencial",
                        Body = $"Cuerpo de la notificación de la validación de la credencial para votar {tag1}",
                        Tag = "ValidacionCredencial",
                        Id = string.Empty,
                        Value = typeCredential
                    }
                }
            };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);
            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationandroiddeteccionnews")]
        public async Task<IHttpActionResult> SendNotificationAndroidDeteccionNews(string tag1, string idNew)
        {
            var noticia = await db.DATNoticias.FirstOrDefaultAsync(n => n.IdNoticia == new Guid(idNew));
            var openGraph = await OpenGraph.ParseUrlAsync(noticia.Link);
            string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
            NewsNotification news = new NewsNotification
            {
                Title = openGraph.Title,
                UriImage = openGraph.Image.ToString(),
                UrlNews = openGraph.OriginalUrl.ToString(),
                Content = content.Replace("<br>", "\n")
            };

            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "Noticia";
            notificationPush.Notification.Title = noticia.Titulo;
            notificationPush.Notification.Body = news.Title;
            notificationPush.Data.Id = noticia.IdNoticia;
            string[] tags = new string[] { tag1 };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);
            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationiosdeteccionnews")]
        public async Task<IHttpActionResult> SendNotificationiOSDeteccionNews(string tag1, string idNew)
        {
            var noticia = await db.DATNoticias.FirstOrDefaultAsync(n => n.IdNoticia == new Guid(idNew));
            var openGraph = await OpenGraph.ParseUrlAsync(noticia.Link);
            string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
            NewsNotification news = new NewsNotification
            {
                Title = openGraph.Title,
                UriImage = openGraph.Image.ToString(),
                UrlNews = openGraph.OriginalUrl.ToString(),
                Content = content.Replace("<br>", "\n")
            };

            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = news.Title,
                    Parameters = new Parameters
                    {
                        Title = news.Title,
                        Body = $"Body {tag1}",
                        Tag = "Noticia",
                        Id = idNew,
                    }
                }
            };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);
            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationandroiddetecciopoll")]
        public async Task<IHttpActionResult> SendNotificationAndroidDeteccionPoll(string tag1, string idPoll)
        {
            var poll = await db.DATEncuestas.FirstOrDefaultAsync(p => p.IdEncuesta == new Guid(idPoll));

            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "Encuesta";
            notificationPush.Notification.Title = poll.Encuesta;
            notificationPush.Notification.Body = poll.Encuesta;
            notificationPush.Data.Id = poll.IdEncuesta;
            string[] tags = new string[] { tag1 };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);

            return Ok();
        }

        [HttpGet]
        [Route("sendnotificationiosdeteccionpoll")]
        public async Task<IHttpActionResult> SendNotificationiOSDeteccionPoll(string tag1, string idPoll)
        {
            var poll = await db.DATEncuestas.FirstOrDefaultAsync(p => p.IdEncuesta == new Guid(idPoll));

            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "Encuesta";
            notificationPush.Notification.Title = poll.Encuesta;
            notificationPush.Notification.Body = poll.Encuesta;
            notificationPush.Data.Id = poll.IdEncuesta;
            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = poll.Encuesta,
                    Parameters = new Parameters
                    {
                        Title = poll.Encuesta,
                        Body = $"Vigencia al {poll.Vigencia}",
                        Tag = "Encuesta",
                        Id = idPoll,
                    }
                }
            };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);

            return Ok();
        }

        [HttpGet]
        [Route("DeleteDevicesNotificationsDeteccion")]
        public async Task<IHttpActionResult> DeleteDevicesNotificationsDeteccion()
        {
            //NotificationsService sendNotifications = new NotificationsService();
            //await sendNotifications.DeleteAllRegistrationAsync();
            return Ok();
        }

        [HttpGet]
        [Route("DeleteDeviceNotificationDeteccion")]
        public async Task<IHttpActionResult> DeleteDeviceNotificationDeteccion(string registrationId)
        {
            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.DeleteRegistrationAsync(registrationId);
            return Ok();
        }

        [HttpGet]
        [Route("ListDevicesNotificationsDet")]
        public IHttpActionResult ListDevicesNotificationsDet()
        {
            NotificationsService sendNotifications = new NotificationsService();
            List<RegistrationDescription> list = sendNotifications.ListDevicesDet();
            return Ok(list);
        }

        [HttpGet]
        [Route("ListDevicesNotificationsDetFilter")]
        public IHttpActionResult ListDevicesNotificationsDetFilter(string tag)
        {
            NotificationsService sendNotifications = new NotificationsService();
            List<RegistrationDescription> list = sendNotifications.ListDevicesDet();
            var lista = list.Where(x => x.Tags.Contains(tag)).OrderBy(x => x.PnsHandle).ToList();
            return Ok(lista);
        }

        [HttpGet]
        [Route("ChangeTagDeteccionVote")]
        public async Task<IHttpActionResult> ChangeTagDeteccionVote(string filterTag, string addTag)
        {
            NotificationsService sendNotifications = new NotificationsService();
            var result = await sendNotifications.UpdateTagsAsync(filterTag, addTag);
            
            return Ok(result);
        }

        [HttpGet]
        [Route("DeleteTagDeteccionVote")]
        public async Task<IHttpActionResult> DeleteTagDeteccionVote(string filterTag, string addTag)
        {
            NotificationsService sendNotifications = new NotificationsService();
            var result = await sendNotifications.UpdateTagsAsync(filterTag, addTag, true);
            
            return Ok(result);
        }


        //Método para borar todos los dispositivos que solo tiene el tag default
        [HttpGet]
        [Route("DeleteDevicesDeteccionDefault")]
        public async Task<IHttpActionResult> DeleteDevicesDeteccionDefault()
        {
            NotificationsService sendNotifications = new NotificationsService();
            List<RegistrationDescription> list = sendNotifications.ListDevicesDet();

            foreach (var item in list)
            {
                if(item.Tags.Count == 1)
                {
                    if (item.Tags.FirstOrDefault().Equals("default"))
                    {
                        var id = item.RegistrationId;
                        await sendNotifications.DeleteRegistrationAsync(id);
                    }
                }
            }

            return Ok(list);
        }

        //Método para borar todos los dispositivos que solo tiene el tag default
        [HttpGet]
        [Route("ChangeTagsDevicesDeteccion")]
        public async Task<IHttpActionResult> ChangeTagsDevicesDeteccion()
        {
            NotificationsService sendNotifications = new NotificationsService();
            using(var db = new DBDeteccionEntities())
            {
                var guidProceso = new Guid("E12C9AF7-4A07-42C7-B8AA-AA434D827DBA");
                //var guidPersona = new Guid("C9BE3E2A-173B-4ABD-B64A-BD3BD38320B0");

                //var listPersons = await db.DATPersonas.Where(p => p.IdProceso == guidProceso && p.IdPersona == guidPersona).ToListAsync();
                var listPersons = await db.DATPersonas.Where(p => p.IdProceso == guidProceso).ToListAsync();
                List<RegistrationDescription> list = sendNotifications.ListDevicesDet();

                foreach (var person in listPersons)
                {
                    foreach (var item in list)
                    {
                        foreach (var item2 in item.Tags.ToArray())
                        {
                            if (item2 == $"idPerson:{person.IdPersona}")
                            {
                                Section section = await new Sections().GetSection(int.Parse(person.Seccion), int.Parse(person.NoEstado));
                                await sendNotifications.UpdateChangesAsync(new DeviceRegistration { RegistrationId = item.RegistrationId, RegistrationType = item.GetType().Name.Equals("AppleRegistrationDescription") ? "apns" : "fcm" }, section, person.IdPersona, (Guid)person.IdProceso);
                            }
                        }
                    }
                }
            }
            
            return Ok();
        }
        #endregion [ Detecccion]


        #region [ Movilizacion ]
        [HttpGet]
        [Route("sendnotificationandroidmovilizacionnotice")]
        public async Task<IHttpActionResult> SendNotificationAndroidMovilizacionNotice(string tag1, string tag2)
        {
            NotificationPush notificationPush = new NotificationPush();
            notificationPush.Notification.Tag = "Aviso";
            notificationPush.Notification.Title = "Aviso";
            notificationPush.Notification.Body = "Te recuerdo ir a votar este 1 de julio";
            string[] tags = new string[] { tag1 , tag2};

            NotificationsMovService sendNotifications = new NotificationsMovService();
            await sendNotifications.SendNotificationAndroidAsync(notificationPush, tags);
            return Ok();
        }

        [HttpGet]
        [Route("SendNotificationiosmovilizacionnotice")]
        public async Task<IHttpActionResult> SendNotificationiOSMovilizacionNotice(string tag1)
        {
            string[] tags = new string[] { tag1 };
            NotificationPushiOS notificationPushiOS = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = "Título de la notificación\nOtro renglon de la notificación",
                    Parameters = new Parameters
                    {
                        Title = "Título de la notificación\nMás información acerca de la notificación",
                        Body = $"El cuerpo de la notificación es este texto que puede ser bastante largo para poder probar como se ven en la notificaciones {tag1}",
                        Tag = "Aviso",
                        Id = "04F238E2-50B2-4C4D-96EE-9B11F39A91B1",
                    }
                }
            };

            NotificationsMovService sendNotifications = new NotificationsMovService();
            await sendNotifications.SendNotificationiOSAsync(notificationPushiOS, tags);
            return Ok();
        }

        [HttpGet]
        [Route("DeleteDevicesNotificationsMovilizacion")]
        public async Task<IHttpActionResult> DeleteDevicesNotificationsMovilizacion()
        {
            NotificationsMovService sendNotifications = new NotificationsMovService();
            await sendNotifications.DeleteAllRegistrationAsync();
            return Ok();
        }

        [HttpGet]
        [Route("DeleteDeviceNotificationMovilizacion")]
        public async Task<IHttpActionResult> DeleteDeviceNotificationMovilizacion(string registrationId)
        {
            NotificationsMovService sendNotifications = new NotificationsMovService();
            await sendNotifications.DeleteRegistrationAsync(registrationId);
            return Ok();
        }

        [HttpGet]
        [Route("ListDevicesNotificationsMov")]
        public IHttpActionResult ListDevicesNotificationsMov()
        {
            NotificationsMovService sendNotifications = new NotificationsMovService();
            var list = sendNotifications.ListDevicesMov();
            return Ok(list);
        }

        [HttpGet]
        [Route("ChangeTags")]
        public async Task<IHttpActionResult> Changetags(string handle)
        {
            var idTerritorio = 4;
            var idProceso = Guid.NewGuid();
            DeviceRegistration deviceRegistration = new DeviceRegistration { PNSHandle = handle };

            NotificationsMovService sendNotifications = new NotificationsMovService();
            await sendNotifications.UpdateRegistrationAsync(idTerritorio, idProceso, "mobile", deviceRegistration);
            return Ok();
        }
        #endregion

        #region [ Helpers ]
        private string GetBetween(string strSource, string strStart, string strEnd)
        {
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                int start = strSource.IndexOf(strStart, 0) + strStart.Length;
                int end = strSource.IndexOf(strEnd, start);
                return strSource.Substring(start, end - start);
            }

            return "";
        }
        #endregion
    }
}