using Elecciones.Common.Responses;
using Elecciones.Models.DBSMovilizacion;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class StatesController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();

        [HttpGet]
        public async Task<IHttpActionResult> GetStates()
        {
            var states = await  db.CATEstado
                .OrderBy(s => s.Nombre)
                .Select(s => new StateResponse
                {
                    IdState = s.IdEstado,
                    Name = s.Nombre
                }).ToListAsync();
            return Ok(states);
        }

        [HttpGet]
        public async Task<IHttpActionResult> GetMunicipalities([FromUri] int idEstado)
        {
            var municipalities = await db.CATMunicipios
                .Where(m => m.IdEstado == idEstado)
                .OrderBy(m => m.descripcion)
                .Select(m => new MunicipalityResponse
                { 
                    IdMunicipality =  m.IdMunicipio, 
                    Description = m.descripcion 
                }).ToListAsync();
            return Ok(municipalities);
        }
    }
}
