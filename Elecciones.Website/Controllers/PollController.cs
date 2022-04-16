namespace Elecciones.Website.Controllers
{
    using Elecciones.Common.Models;
    using Elecciones.Common.Models.Criteria;
    using Elecciones.Common.Responses;
    using Elecciones.Logic.Poll;
    using Elecciones.Logic.Security;
    using Elecciones.Logic.Services;
    using Elecciones.Website.Models;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Mvc;

    [Authorize]
    public class PollController : Controller
    {
        // GET: Poll
        [Authorize(Roles = "Encuestas")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Encuestas")]
        public ActionResult IndexPoll()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas")]
        public JsonResult GetPollList(List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetPollList(criteria, processId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult DeletePoll(Guid pollId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.DeletePoll(pollId);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public async Task<JsonResult> ChangeStatusPoll(Guid idEncuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);

            bool sendNotification = false;
            var result = manager.ChangeStatusPoll(idEncuesta, ref sendNotification);
            if (sendNotification)
            {
                await SendNotification(idEncuesta);
                manager.SetNotificationSended(idEncuesta);
            }
            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        private async Task SendNotification(Guid idEncuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);

            var encuesta = manager.GetPoll(idEncuesta);

            var notification = new NotificationPush
            {
                Data = new Data
                {
                    Id = encuesta.Identifier
                },
                Notification = new Notification
                {
                    Tag = "Encuesta",
                    Title = encuesta.Nombre,
                    Body = encuesta.Nombre
                }
            };

            var notificationIos = new NotificationPushiOS
            {
                Aps = new Aps
                {
                    Alert = encuesta.Nombre,
                    Parameters = new Parameters
                    {
                        Body = encuesta.Nombre,
                        Id = encuesta.Identifier.ToString(),
                        Tag = "Encuesta",
                        Title = encuesta.Nombre
                    }
                }
            };

            var tag = manager.GetTagEncuesta(idEncuesta, proceso.Id);
            var tags = new string[] { tag };
            NotificationsService sendNotifications = new NotificationsService();
            await sendNotifications.SendNotificationAndroidAsync(notification, tags);
            await sendNotifications.SendNotificationiOSAsync(notificationIos, tags);
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult DeleteQuestion(Guid idPregunta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.DeleteQuestion(idPregunta);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult ChangeStatusQuestion(Guid idPregunta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.ChangeStatusQuestion(idPregunta);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult DeleteAnswer(Guid idRespuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.DeleteAnswer(idRespuesta);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult ChangeStatusAnswer(Guid idRespuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.ChangeStatusAnswer(idRespuesta);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult AddPoll(List<VCriteria> criteria, string encuesta, string vigencia)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.AddPoll(criteria, encuesta, vigencia);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult EditPoll(Guid idEncuesta, string encuesta, string vigencia)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.EditPoll(idEncuesta, encuesta, vigencia);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult EditQuestion(Guid idPregunta, string pregunta, int typeId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var result = manager.EditQuestion(idPregunta, pregunta, typeId);

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult GetPoll(Guid idEncuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetPoll(idEncuesta);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult AddQuestion(Guid idEncuesta, string pregunta, int typeId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.AddQuestion(idEncuesta, pregunta, typeId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult AddAnswer(Guid idPregunta, string respuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.AddAnswer(idPregunta, respuesta);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Encuestas.Modificar")]
        public JsonResult EditAnswer(Guid idRespuesta, string respuesta)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new PollManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.EditAnswer(idRespuesta, respuesta);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

    }
}
