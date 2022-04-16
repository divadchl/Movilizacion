using Elecciones.Common.Models.Territory;
using Elecciones.Logic;
using Elecciones.Logic.Security;
using Elecciones.Logic.Territory;
using Elecciones.Website.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Elecciones.Website.Controllers
{
    [Authorize]
    public class TerritoryController : Controller
    {
        [HttpPost]
        public JsonResult StackTerritory(string stack, int tipo)
        {
            var obj = JsonConvert.DeserializeObject<List<VDummy>>(stack);
            var selector = new TerritorioSelector(User.Identity.Name);
            var territory = (User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"))
                ? selector.BringsTerritoryFatherInAdmin(obj, (ETerritorioOrder.TerritorioOrder)tipo)
                : selector.BringsTerritoryFather(obj, (ETerritorioOrder.TerritorioOrder)tipo);

            return new JsonResult
            {
                Data = territory,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [HttpGet]
        public JsonResult GetStates()
        {
            List<TerritorioModel> data;
            if (User.IsInGroup("Admin") || User.IsInGroup("SuperAdmin"))
            {
                data = TerritorioManager.GetEstados();
            }
            else
            {
                var processId = User.GetProcessId().Value;
                var proceso = ProcesoManager.GetProcesoById(processId);
                var filter = new TerritorioFilter(User.Identity.Name, proceso);
                data = TerritorioManager.GetEstados().Where(p => filter.Estados.Contains(p.IdEstado)).ToList();
            }

            var result = data.Select(state => new StateDto
            {
                Identifier = state.IdEstado,
                State = state.Name,
                Abbreviation = state.ShortName
            }).ToList();

            return new JsonResult
            {
                Data = result,
                MaxJsonLength = int.MaxValue,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}
