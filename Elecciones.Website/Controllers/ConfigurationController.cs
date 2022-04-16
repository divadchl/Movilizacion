using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Proceso;
using Elecciones.Logic.Proceso;
using Elecciones.Logic.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class ConfigurationController : Controller
    {
        // GET: Configuration
        public ActionResult IndexProcess()
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetProcess(List<VCriteria> criteria)
        {
            var manager = new ProcessManager();
            var list = manager.GetProcesos(criteria);
            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        public JsonResult SaveProcess(ProcessDto proceso)
        {
            var manager = new ProcessManager();
            var result = manager.SaveProcess(proceso, User.Identity.Name);
            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        public JsonResult EditProcess(Guid idProceso, string name)
        {
            var manager = new ProcessManager();
            var result = manager.EditProcess(idProceso, name);
            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        public JsonResult ChangeStatusProcess(Guid idProceso)
        {
            var manager = new ProcessManager();
            var result = manager.ChangeStatusProcess(idProceso);
            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpGet]
        public JsonResult GetEncartes()
        {
            var manager = new ProcessManager();
            var result = manager.GetEncartes();
            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }


        //[HttpPost]
        //public JsonResult UpdateProcess(Guid idNoticia, string title, string link)
        //{
        //    var processId = User.GetProcessId().Value;
        //    var proceso = ProcesoManager.GetProcesoById(processId);


        //    var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
        //    var list = manager.UpdateNew(idNoticia, title, link);

        //    return new JsonResult
        //    {
        //        Data = list,
        //        MaxJsonLength = int.MaxValue,
        //        JsonRequestBehavior = JsonRequestBehavior.AllowGet
        //    };
        //}

        //[HttpPost]
        //public JsonResult ChangeStatusNew(Guid idNoticia)
        //{
        //    var processId = User.GetProcessId().Value;
        //    var proceso = ProcesoManager.GetProcesoById(processId);
        //    var manager = new NewsManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
        //    var list = manager.ChangeStatusNew(idNoticia);

        //    return new JsonResult
        //    {
        //        Data = list,
        //        MaxJsonLength = int.MaxValue,
        //        JsonRequestBehavior = JsonRequestBehavior.AllowGet
        //    };

        //}



    }
}
