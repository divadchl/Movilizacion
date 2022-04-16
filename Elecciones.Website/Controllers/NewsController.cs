using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.News;
using Elecciones.Logic.News;
using Elecciones.Logic.Security;
using Elecciones.Logic.Services;
using Elecciones.Website.Models;
using Newtonsoft.Json;
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
    public class NewsController : Controller
    {
        [Authorize(Roles = "Noticias")]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Noticias")]
        public JsonResult GetNews(List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetNews(criteria, processId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Noticias")]
        public JsonResult GetNew(Guid idNoticia)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetNew(idNoticia);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

        }

        [HttpPost]
        [Authorize(Roles = "Noticias.Modificar")]
        public async Task<JsonResult> SaveNew(List<VCriteria> criteria, string title, string link)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);

            if (criteria == null) criteria = new List<VCriteria>();
            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var newDto = manager.SaveNew(criteria, title, link);
            await SendNotification(newDto,link, criteria, proceso.Id);
            return new JsonResult
            {
                Data = newDto,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        private async Task SendNotification(NewDto newDto, string link, List<VCriteria> criteria, Guid idProceso)
        {
            var openGraph = OpenGraph.ParseUrl(link);
            string content = NewsManager.GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
            NewsNotification news = new NewsNotification
            {
                Title = openGraph.Title,
                UriImage = openGraph.Image.ToString(),
                UrlNews = openGraph.OriginalUrl.ToString(),
                Content = content.Replace("<br>", "\n")
            };

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

            var notification = new NotificationPush
            {
                Data = new Data
                {
                    Id = newDto.IdNoticia,
                },
                Notification = new Notification
                {
                    Tag = "Noticia",
                    Title = news.Title,
                    Body = news.Title
                }
            };

            var notificationIos = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = news.Title,
                    Parameters = new Parameters
                    {
                        Body = news.Title,
                        Id = newDto.IdNoticia.ToString(),
                        Tag = "Noticia",
                        Title = news.Title
                    }
                }
            };

            var tags = new string[] { tag };

            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notification, tags);
            await sendNotifications.SendNotificationiOSAsync(notificationIos, tags);
        }

        [HttpPost]
        [Authorize(Roles = "Noticias.Modificar")]
        public JsonResult UpdateNew(Guid idNoticia, string title, string link)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);


            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.UpdateNew(idNoticia, title, link);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        [HttpPost]
        [Authorize(Roles = "Noticias.Modificar")]
        public JsonResult DeleteNew(Guid idNoticia)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.DeleteNew(idNoticia);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        [HttpPost]
        [Authorize(Roles = "Noticias.Modificar")]
        public JsonResult ChangeStatusNew(Guid idNoticia)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.ChangeStatusNew(idNoticia);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };

        }


    }
}
