using Elecciones.Logic.Security;
using Elecciones.Logic.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Elecciones.Website.Models;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index()
        {
            //FormRecognizerService formRecognizerService = new FormRecognizerService();
            // await formRecognizerService.RecognizeContentCustomModelStream(credentialsRequest.ImageFront);
            //var task = Task.Run(async () => await formRecognizerService.RecognizeContentUri());
            //await formRecognizerService.RecognizeContentUri();
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public JsonResult GetProcessUser()
        {
            var list = (User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"))
                ? ProcesoManager.GetProcesos()
                : ProcesoManager.GetProcesosForUser(User.Identity.Name);
            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        public JsonResult SetProcess(Guid processId)
        {
            var process = ProcesoManager.GetProcesoById(processId);
            if (process != null)
            {
                User.SetProcess(process.Id, process.Name);
            }
            return new JsonResult
            {
                Data = true,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        public JsonResult GetCurrentProcess()
        {
            var processId = User.GetProcessId();
            return new JsonResult
            {
                Data = processId.HasValue ? processId.Value.ToString() : "" ,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

    }
}