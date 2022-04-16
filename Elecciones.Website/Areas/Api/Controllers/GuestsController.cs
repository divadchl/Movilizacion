using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Models.DBSMovilizacion;
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
    public class GuestsController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();
        /// <summary>
        /// Se registra al invitado
        /// </summary>
        /// <param name="guestRequest"></param>
        [HttpPost]
        [Route("api/guests/registerguest")]
        public async Task<IHttpActionResult>RegisterGuest([FromBody]GuestRequest guestRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                DATInvitados guest = await db.DATInvitados.Where(g => g.Telefono == guestRequest.Telefono && g.IdPersona == guestRequest.IdPersona).FirstOrDefaultAsync();
                if (guest == null)
                {
                    DATPersonas persona = await db.DATPersonas.FirstOrDefaultAsync(u => u.IdPersona == guestRequest.IdPersona);
                    if (persona == null)
                        return BadRequest("El usuario no se encuentra registrado");

                    DATInvitados dATInvitados = new DATInvitados
                    {
                        IdInvitado = Guid.NewGuid(),
                        Telefono = guestRequest.Telefono,
                        Correo = guestRequest.Correo,
                        Nombre = guestRequest.Nombre,
                        DATPersonas = persona,
                        CodigoInvitacion = guestRequest.CodigoInvitacion,
                        IdProceso = guestRequest.IdProceso,
                        App = guestRequest.App,
                        IdUser = null
                    };

                    db.DATInvitados.Add(dATInvitados);
                    await db.SaveChangesAsync();
                    return Ok(new Response { IsSuccess = true });
                }
                else
                {
                    DATPersonas persona = await db.DATPersonas.FirstOrDefaultAsync(u => u.IdPersona == guestRequest.IdPersona);
                    if (persona == null)
                        return BadRequest("El usuario no se encuentra registrado");

                    guest.Correo = guestRequest.Correo;
                    guest.Nombre = guestRequest.Nombre;
                    guest.CodigoInvitacion = guestRequest.CodigoInvitacion;
                    guest.IdProceso = guestRequest.IdProceso;
                    guest.App = guestRequest.App;

                    await db.SaveChangesAsync();
                    return Ok(new Response { IsSuccess = true, Message = "Se actualizó el contacto" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se obtiene los invitados que no han sido confirmados
        /// </summary>
        /// <param name="personRequest"></param>
        /// <returns>Lista de invitados no confirmados</returns>
        [HttpPost]
        [Route("api/guests/getguestsnotconfirm")]
        public async Task<IHttpActionResult> GetGuestNotConfirm([FromBody] PersonRequest personRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                List<GuestsResponse> guests = await db.DATInvitados
                    .Include(p => p.DATPersonas)
                    .Where(g => g.IdPersona == personRequest.IdPerson)
                    .OrderBy(g => g.Nombre)
                    .Select(x => new GuestsResponse
                    {
                        IdInvitado = x.IdInvitado,
                        Nombre = x.Nombre
                    })
                    .ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se obtiene los invitados que ya han sido confirmados
        /// </summary>
        /// <param name="personRequest"></param>
        /// <returns>Listado de invitados confirmados</returns>
        [HttpPost]
        [Route("api/guests/getguestsconfirm")]
        public async Task<IHttpActionResult> GetGuestConfirm([FromBody] PersonRequest personRequest)
        
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                List<GuestsResponse> guests = await (from g in db.DATPersonas
                                                     where (g.IdPadre == personRequest.IdPerson)
                                                     select new GuestsResponse
                                                     {
                                                         IdInvitado = new Guid(),
                                                         Nombre = g.Nombre + " " + g.Paterno + " " + g.Materno
                                                     }).ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se registra al invitado de MyMov
        /// </summary>
        /// <param name="guestRequest"></param>
        [HttpPost]
        [Route("api/guests/registerguestmymov")]
        public async Task<IHttpActionResult> RegisterGuestMyMov([FromBody] GuestRequest guestRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                DATInvitados guest = await db.DATInvitados.Where(g => g.Telefono == guestRequest.Telefono && g.IdUser == guestRequest.IdUser).FirstOrDefaultAsync();
                if (guest == null)
                {
                    DATInvitados dATInvitados = new DATInvitados
                    {
                        IdInvitado = Guid.NewGuid(),
                        Telefono = guestRequest.Telefono,
                        Correo = guestRequest.Correo,
                        Nombre = guestRequest.Nombre,
                        IdPersona = null,
                        CodigoInvitacion = guestRequest.CodigoInvitacion,
                        IdProceso = guestRequest.IdProceso,
                        App = guestRequest.App,
                        IdUser = guestRequest.IdUser
                    };

                    db.DATInvitados.Add(dATInvitados);
                    await db.SaveChangesAsync();
                    return Ok(new Response { IsSuccess = true });
                }
                else
                {
                    guest.Correo = guestRequest.Correo;
                    guest.Nombre = guestRequest.Nombre;
                    guest.CodigoInvitacion = guestRequest.CodigoInvitacion;
                    guest.IdProceso = guestRequest.IdProceso;
                    guest.App = guestRequest.App;

                    await db.SaveChangesAsync();
                    return Ok(new Response { IsSuccess = true, Message = "Se actualizó el contacto" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se obtiene los invitados que no han sido confirmados de MyMov
        /// </summary>
        /// <param name="personRequest"></param>
        /// <returns>Lista de invitados no confirmados de MyMov</returns>
        [HttpPost]
        [Route("api/guests/getguestsnotconfirmmymov")]
        public async Task<IHttpActionResult> GetGuestNotConfirmMyMov([FromBody] PersonRequest personRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                List<GuestsResponse> guests = await db.DATInvitados
                    .Include(p => p.DATPersonas)
                    .Where(g => g.IdUser == personRequest.IdPerson)
                    .OrderBy(g => g.Nombre)
                    .Select(x => new GuestsResponse
                    {
                        IdInvitado = x.IdInvitado,
                        Nombre = x.Nombre
                    })
                    .ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se obtiene los invitados que ya han sido confirmados de MyMov
        /// </summary>
        /// <param name="personRequest"></param>
        /// <returns>Listado de invitados confirmados de MyMov</returns>
        [HttpPost]
        [Route("api/guests/getguestsconfirmmymov")]
        public async Task<IHttpActionResult> GetGuestConfirmMyMov([FromBody] PersonRequest personRequest)

        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                List<GuestsResponse> guests = await (from g in db.DATPersonas
                                                     where (g.IdUserPadre == personRequest.IdPerson)
                                                     select new GuestsResponse
                                                     {
                                                         IdInvitado = new Guid(),
                                                         Nombre = g.Nombre + " " + g.Paterno + " " + g.Materno
                                                     }).ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
