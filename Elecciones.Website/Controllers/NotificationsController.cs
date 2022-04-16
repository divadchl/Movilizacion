using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Notifications;
using Elecciones.Logic.Notifications;
using Elecciones.Logic.Security;
using Elecciones.Logic.Services;
using OpenGraphNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class NotificationsController : Controller
    {
        [Authorize(Roles = "Notificaciones")]
        // GET: Notifications
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Notificaciones")]
        public JsonResult GetNotifications()
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NotificationsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);

            var criteria = new List<VCriteria>();
            criteria.Add(new VCriteria { PropertyName = "IdEstado", Comparer = "Equals", Value = proceso.IdEstado });

            var list = manager.GetNotifications(criteria);
            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }


        [HttpPost]
        [Authorize(Roles = "Notificaciones.Modificar")]
        public async Task<JsonResult> CreateNotification(List<VCriteria> criteria, NotificationDto notification)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NotificationsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var notificationDto = manager.CreateNotification(criteria, notification);
            await SendNotification(notificationDto, criteria, proceso.Id);

            return new JsonResult
            {
                Data = notificationDto != null,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        private async Task SendNotification(NotificationDto notificationDto, List<VCriteria> criteria, Guid idProceso)
        {
            var tag = "";
            var idEstado = criteria.Any(c => c.PropertyName == "IdEstado") ? criteria.First(c => c.PropertyName == "IdEstado").Value : null;
            var idMunicipio = criteria.Any(c => c.PropertyName == "IdMunicipio") ? criteria.First(c => c.PropertyName == "IdMunicipio").Value : null;
            var idDistritoFederal = criteria.Any(c => c.PropertyName == "IdDistritoFederal") ? criteria.First(c => c.PropertyName == "IdDistritoFederal").Value : null;
            var idDistritoLocal = criteria.Any(c => c.PropertyName == "IdDistritoLocal") ? criteria.First(c => c.PropertyName == "IdDistritoLocal").Value : null;
            var idSeccion = criteria.Any(c => c.PropertyName == "IdSeccion") ? criteria.First(c => c.PropertyName == "IdSeccion").Value : null;

            if (idSeccion != null)
            {
                tag = $"seccion:{idProceso.ToString()}_{idSeccion}";
            }
            else if (idDistritoFederal != null && idDistritoLocal != null)
            {
                tag = $"federallocaldistrict:{idProceso.ToString()}_{idDistritoFederal}_{idDistritoLocal}";
            }
            else if (idDistritoLocal != null)
            {
                tag = $"localdistrict:{idProceso.ToString()}_{idDistritoLocal}";
            }
            else if (idDistritoFederal != null)
            {
                tag = $"federaldistrict:{idProceso.ToString()}_{idDistritoFederal}";
            }
            else if (idMunicipio != null)
            {
                tag = $"municipality:{idProceso.ToString()}_{idMunicipio}";
            }
            else if (idEstado != null)
            {
                tag = $"state:{idProceso.ToString()}_{idEstado}";
            }
            var tags = new string[] { tag };

            var notification = new NotificationPush
            {
                Data = new Data
                {
                    Id = notificationDto.Id
                },
                Notification = new Notification
                {
                    Tag = "Aviso",
                    Title = notificationDto.Titulo,
                    Body = notificationDto.Mensaje
                }
            };

            var notificationIos = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = notificationDto.Titulo,
                    Parameters = new Parameters
                    {
                        Body = notificationDto.Mensaje,
                        Id = notificationDto.Id.ToString(),
                        Tag = "Aviso",
                        Title = notificationDto.Titulo
                    }
                }
            };

            if (notificationDto.Aplicacion == "MyDet")
            {
                NotificationsService sendNotifications = new NotificationsService();
                await sendNotifications.SendNotificationAndroidAsync(notification, tags);
                await sendNotifications.SendNotificationiOSAsync(notificationIos, tags);
            }
            else if (notificationDto.Aplicacion == "MyMov")
            {
                NotificationsMovService sendNotifications = new NotificationsMovService();
                await sendNotifications.SendNotificationAndroidAsync(notification, tags);
                await sendNotifications.SendNotificationiOSAsync(notificationIos, tags);
            }
        }


    }
}
