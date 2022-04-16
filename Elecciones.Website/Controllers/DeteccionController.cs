using Elecciones.Logic.Utilities;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Website.Models.Deteccion;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Mvc;
using Elecciones.Common.Models.Criteria;
using Elecciones.Logic.Deteccion;
using System.IO;
using Elecciones.Website.Models;
using Elecciones.Logic.Security;
using Elecciones.Common.Models.Detectado;
using Newtonsoft.Json;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class DeteccionController : Controller
    {
        [Authorize(Roles = "Movilizacion")]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Movilizacion")]
        public JsonResult PersonList(List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetPersonList(criteria, processId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Movilizacion")]
        public JsonResult GetContact(Guid personId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.GetContact(personId);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Movilizacion")]
        public ActionResult GetCredentialFront(Guid personId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var file = manager.GetImageIne(personId, 1);
            Response.AddHeader("Content-Disposition", "inline; filename=" + file.Name);
            return File(file.Photo, "image/" + Path.GetExtension(file.Name));
        }

        [Authorize(Roles = "Movilizacion")]
        public ActionResult GetCredentialBack(Guid personId)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var file = manager.GetImageIne(personId, 2);
            Response.AddHeader("Content-Disposition", "inline; filename=" + file.Name);
            return File(file.Photo, "image/" + Path.GetExtension(file.Name));
        }

        [Authorize(Roles = "Ubicaciones")]
        public ActionResult Locations()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Ubicaciones")]
        public JsonResult LocationList(List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var process = User.GetProcessId().Value;
            var list = manager.GetPersonList(criteria, process);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Ubicaciones")]
        public JsonResult BoxesList(List<VCriteria> criteria)
        {
            if (criteria == null) criteria = new List<VCriteria>();
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var process = User.GetProcessId().Value;
            var list = manager.GetBoxesList(process, criteria);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [Authorize(Roles = "Movilizacion")]
        public ActionResult Boxes()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = "Movilizacion")]
        public async Task<JsonResult> LoadIneInformation(int type, string ineFront, string ineBack)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = await manager.LoadIneInformation(type, ineFront, ineBack);
            
            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpPost]
        [Authorize(Roles = "Movilizacion")]
        public JsonResult SaveNewPerson(PersonaIne person)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.SaveNewPerson(person);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }


        [HttpPost]
        [Authorize(Roles = "Movilizacion")]
        public JsonResult ExistsIneRegister(string ine)
        {
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var list = manager.ExistsIneRegister(ine);

            return new JsonResult
            {
                Data = list,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }


        #region Temporal
        //[Authorize(Roles = "Movilizacion")]
        public ActionResult BoxesTmp()
        {
            return View();
        }

        [HttpGet]
        //[Authorize(Roles = "Ubicaciones")]
        public ActionResult GetBoxesList(int draw, int? start, int? length, string searchDetail, int? orderColumn, string orderDirection, int? state, int? municipality, int? federalDistrict, int? localDistrict, int? section)
        {
            var totalRecords = 0;
            var filteredRecords = 0;
            
            var processId = User.GetProcessId().Value;
            var proceso = ProcesoManager.GetProcesoById(processId);
            var manager = new DetectadoManager(User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"), User.Identity.Name, proceso);
            var process = User.GetProcessId().Value;

            var result = manager.GetBoxes(start, length, searchDetail, orderColumn, orderDirection, out totalRecords, out filteredRecords, process, state, municipality, federalDistrict, localDistrict, section);

            var response = new { draw, recordsTotal = totalRecords, recordsFiltered = filteredRecords, data = result };

            return Content(JsonConvert.SerializeObject(response), "application/json");
        }
        #endregion
    }
}