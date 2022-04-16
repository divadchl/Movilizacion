using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Detectado;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.Security;
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
    [Authorize]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/persons")]
    public class PersonsController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();

        [HttpPost]
        [Route("getpersons")]
        public IHttpActionResult GetPersons([FromBody] PersonMovRequest personMovRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var process = ProcesoManager.GetProcesoById(personMovRequest.IdProcess);
            List<VCriteria> criteria = new List<VCriteria>
            {
                new VCriteria
                {
                    PropertyName = "IdEstado",
                    Comparer = "Equals",
                    Value = personMovRequest.IdState
                }
            };

            DetectadoManager manager = new DetectadoManager(false, personMovRequest.UserName, process);
            List<DetectadoDto> list = manager.GetPersonList(criteria, personMovRequest.IdProcess);
            var persons = list.Select(x => new Person
            {
                IdPersona = x.IdPersona,
                Paterno = x.Paterno,
                Materno = x.Materno,
                Nombre = x.Nombre,
                Calle = x.Calle,
                NoExterior = x.NoExterior,
                NoInterior = x.NoInterior,
                Colonia = x.Colonia,
                CP = x.CodigoPostal,
                Municipio = x.Municipio,
                Estado = x.Estado,
                Longitud = x.Longitud,
                Latitud = x.Latitud,
                Contact = x.Contactos.FirstOrDefault(),
                Address = x.DomiciliosAdicionales.FirstOrDefault(),
            }).ToList();

            PersonsResponse personsResponse = new PersonsResponse
            {
                Persons = persons,
                Stalls = null
            };

            return Ok(personsResponse);
        }

        [HttpPost]
        [Route("getstalls")]
        public IHttpActionResult GetStalls([FromBody] PersonMovRequest personMovRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var process = ProcesoManager.GetProcesoById(personMovRequest.IdProcess);
            List<VCriteria> criteria = new List<VCriteria>
            {
                new VCriteria
                {
                    PropertyName = "IdEstado",
                    Comparer = "Equals",
                    Value = personMovRequest.IdState
                }
            };

            DetectadoManager manager = new DetectadoManager(false, personMovRequest.UserName, process);
            
            List<Stall> stalls = manager.GetBoxesList(process.Id, criteria).Select(s => new Stall
            {
                IdStall = s.IdCasilla,
                StallType = s.Casilla,
                Address = s.Domicilio,
                Reference = s.Referencia,
                Location = s.Ubicacion,
                Latitude = s.Latitud,
                Longitude = s.Longitud,
                IdTypeStall = s.IdTipoCasilla,
                TypeStall = s.TipoCasilla,
                IdFederalDistrict = s.IdDistritoFederal,
                FederalDistrict = s.DistritoFederal,
                IdState = s.IdEstado,
                State = s.Estado,
                IdMunicipality = s.IdMunicipio,
                Municipality = s.Municipio,
                IdLocalDistrict = s.IdDistritoLocal,
                LocalDistrict = s.DistritoLocal,
                IdSection = s.IdSeccion,
                Section = s.Seccion,
                ReportStalls = s.ReporteCasilla
            }).ToList();

            PersonsResponse personsResponse = new PersonsResponse
            {
                Persons = null,
                Stalls = stalls
            };

            return Ok(personsResponse);
        }

        [HttpPost]
        [Route("getperson")]
        public async Task<IHttpActionResult> GetPerson([FromBody] PersonRequest personRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var person = await (from p in db.DATPersonas
                                    join dp in db.DATDoctoPersona on p.IdPersona equals dp.IdPersona
                                    join ud in db.UsersDeteccion on p.IdUsuario equals ud.id
                                    join a in db.DATDomicilios on p.IdPersona equals a.IdPersona into ap
                                    from a in ap.DefaultIfEmpty()
                                    where dp.IdTipoDocumento == 1 && p.IdPersona == personRequest.IdPerson
                                    select new PersonDetailResponse
                                    {
                                        IdPersona = p.IdPersona,
                                        Paterno = p.Paterno,
                                        Materno = p.Materno,
                                        Nombre = p.Nombre,
                                        Calle = p.Calle,
                                        NoExterior = p.NoExterior,
                                        NoInterior = p.NoInterior,
                                        Colonia = p.Colonia,
                                        CP = p.CP,
                                        Municipio = p.Municipio,
                                        Estado = p.Estado,
                                        ClaveINE = p.ClaveINE,
                                        NoEstado = p.NoEstado,
                                        NoMunicipio = p.NoMunicipio,
                                        Seccion = p.Seccion,
                                        Longitud = p.Longitud,
                                        Latitud = p.Latitud,
                                        Documento = dp.Documento,
                                        Correo = ud.email,
                                        Telefono = ud.Telefono,
                                        Address = db.DATDomicilios
                                         .Where(a => a.IdPersona == personRequest.IdPerson)
                                         .Select(a => new AddressDto
                                         {
                                             Direccion = a.Calle,
                                             Colonia = a.Colonia,
                                             CodigoPostal = a.CP,
                                             Municipio = a.CATMunicipios.descripcion,
                                             Estado = a.CATEstado.Nombre,
                                             NumeroExterior = a.NoExterior,
                                             NumeroInterior = a.NoInterior,
                                             Latitud = a.Latitud,
                                             Longitud = a.Longitud,
                                             IdPersona = a.IdPersona
                                         }).FirstOrDefault(),
                                        Contact = p.DATContacto.Where(c => c.IdPersona == personRequest.IdPerson).OrderByDescending(c => c.FechaHora).Select(c => new ContactDto
                                        {
                                            IdContacto = c.IdContacto,
                                            IdTipoContacto = c.IdTipoContacto,
                                            TipoContacto = c.CATTipoContacto.TipoContacto
                                        }).FirstOrDefault()
                                    }).FirstOrDefaultAsync();

                return Ok(person);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException.Message);
            }
        }

        [HttpGet]
        [Route("getactions")]
        public async Task<IHttpActionResult> GetActions()
        {
            List<ActionModel> typeContacts = await db.CATTipoContacto.Select(tc => new ActionModel
            {
                IdTypeContact = tc.IdTipoContacto,
                TypeContact = tc.TipoContacto,
            }).ToListAsync();
            
            return Ok(typeContacts);
        }

        [HttpPost]
        [Route("postcontactedperson")]
        public async Task<IHttpActionResult> SaveContactedPerson([FromBody] PersonContactedRequest personContactedRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                DATContacto contactSave = new DATContacto
                {
                    IdContacto = Guid.NewGuid(),
                    IdProceso = personContactedRequest.IdProces,
                    IdPersona = personContactedRequest.IdPerson,
                    IdTipoContacto = personContactedRequest.IdTypeContact,
                    Usuario = personContactedRequest.User,
                    FechaHora = personContactedRequest.DateTime
                };
                db.DATContacto.Add(contactSave);
                await db.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Route("postgetgraphics")]
        public IHttpActionResult GetGraphics([FromBody] PersonMovRequest personMovRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                ProcesoModel process = ProcesoManager.GetProcesoById(personMovRequest.IdProcess);
                List<VCriteria> criteria = new List<VCriteria>
                {
                    new VCriteria
                    {
                        PropertyName = "IdEstado",
                        Comparer = "Equals",
                        Value = personMovRequest.IdState
                    }
                };

                DetectadoManager manager = new DetectadoManager(false, personMovRequest.UserName, process);
                List<DetectadoDto> list = manager.GetPersonList(criteria, personMovRequest.IdProcess);
                List<Person> persons = list.Select(x => new Person
                {
                    IdPersona = x.IdPersona,
                    Paterno = x.Paterno,
                    Materno = x.Materno,
                    Nombre = x.Nombre,
                    Calle = x.Calle,
                    NoExterior = x.NoExterior,
                    NoInterior = x.NoInterior,
                    Colonia = x.Colonia,
                    CP = x.CodigoPostal,
                    Municipio = x.Municipio,
                    Estado = x.Estado,
                    Longitud = x.Longitud,
                    Latitud = x.Latitud,
                    Contact = x.Contactos.FirstOrDefault(),
                    Address = x.DomiciliosAdicionales.FirstOrDefault(),
                }).ToList();
               
                var totalPersons = persons.Count();
                var totalIncapacitado = persons.Where(p => p.Contact?.IdTipoContacto == 1).ToList().Count();
                var totalSinMedioTransporte = persons.Where(p => p.Contact?.IdTipoContacto == 2).ToList().Count();
                var totalTranslado = persons.Where(p => p.Contact?.IdTipoContacto == 3).ToList().Count();
                var totalIndeciso = persons.Where(p => p.Contact?.IdTipoContacto == 4).ToList().Count();
                var totalCasillaIncorrecta = persons.Where(p => p.Contact?.IdTipoContacto == 5).ToList().Count();
                var totalCasillaNoLocalizada = persons.Where(p => p.Contact?.IdTipoContacto == 6).ToList().Count();
                var totalNoLocalizado = persons.Where(p => p.Contact?.IdTipoContacto == 7).ToList().Count();
                var totalVoto = persons.Where(p => p.Contact?.IdTipoContacto == 8).ToList().Count();
                var totalNoContactado = totalPersons - totalIncapacitado - totalSinMedioTransporte - totalTranslado - totalIndeciso - totalCasillaIncorrecta - totalCasillaNoLocalizada - totalNoLocalizado - totalVoto;
                GraphicsResponse graphics = new GraphicsResponse();
                graphics.MaxValueTypeContact = totalPersons;
                graphics.SeriesTypeContact = new List<FlowEntryData>
                {
                    new FlowEntryData
                    {
                        Value = totalIncapacitado,
                        Label = "Incapacitado",
                        Color = "#0d47a1",
                    },
                    new FlowEntryData
                    {
                        Value = totalSinMedioTransporte,
                        Label = "Sin medio de transporte",
                        Color = "#1565c0",
                    },
                    new FlowEntryData
                    {
                        Value = totalTranslado,
                        Label = "En traslado",
                        Color = "#1976d2",
                    },
                    new FlowEntryData
                    {
                        Value = totalIndeciso,
                        Label = "Indeciso",
                        Color = "#1e88e5",
                    },
                    new FlowEntryData
                    {
                        Value = totalCasillaIncorrecta,
                        Label = "Casilla incorrecta",
                        Color = "#42a5f5",
                    },
                    new FlowEntryData
                    {
                        Value = totalCasillaNoLocalizada,
                        Label = "Casilla no localizada",
                        Color = "#90caf9",
                    },
                    new FlowEntryData
                    {
                        Value = totalNoLocalizado,
                        Label = "No localizado",
                        Color = "#F2090E",
                    },
                    new FlowEntryData
                    {
                        Value = totalVoto,
                        Label = "Voto",
                        Color = "#1B943F",
                    },
                    new FlowEntryData
                    {
                        Value = totalNoContactado,
                        Label = "No Contactado",
                        Color = "#e3f2fd",
                    }
                };

                //graphics.MaxValueVote = totalPersons;
                //graphics.SeriesVote = new List<FlowEntryData>
                //{
                //    new FlowEntryData
                //    {
                //        Value = totalPersons-totalVotaron,
                //        Label = "No han votado",
                //        Color = "#518DD8",
                //    },
                //    new FlowEntryData
                //    {
                //        Value = totalVotaron,
                //        Label = "Ya han votó",
                //        Color = "#BFE1FF",
                //    }
                //};
                return Ok(graphics);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException.Message);
            }
        }

        [HttpGet]
        [Route("getstatusstall")]
        public async Task<IHttpActionResult> GetStatusStall()
        {
            List<StatusStallResponse> statusStall = await db.CATEstatusCasilla.Select(ss => new StatusStallResponse
            {
                IdStatus = ss.IdEstatusCasilla,
                Status = ss.EstatusCasilla,
                Color = ss.Color
            }).ToListAsync();
            
            return Ok(statusStall);
        }

        [HttpPost]
        [Route("postreportstall")]
        public async Task<IHttpActionResult> SaveReportStall([FromBody] ReportStallRequest reportStallRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                //DATReporteCasilla reportStall = await db.DATReporteCasilla.Where(rs => rs.IdCasilla == reportStallRequest.IdStall).FirstOrDefaultAsync();

                //if (reportStall == null)
                //{
                    DATReporteCasilla reportStallSave = new DATReporteCasilla
                    {
                        IdReporteCasilla = Guid.NewGuid(),
                        IdCasilla = reportStallRequest.IdStall,
                        IdProceso = reportStallRequest.IdProcess,
                        IdEstatusCasilla = reportStallRequest.IdStatusStall,
                        FechaHora = reportStallRequest.DateTime,
                        Comentario = reportStallRequest.Remark ?? "",
                        Usuario = reportStallRequest.User
                    };
                    db.DATReporteCasilla.Add(reportStallSave);
                //}
                //else
                //{
                //    reportStall.IdCasilla = reportStallRequest.IdStall;
                //    reportStall.IdProceso = reportStallRequest.IdProcess;
                //    reportStall.IdEstatusCasilla = reportStallRequest.IdStatusStall;
                //    reportStall.FechaHora = reportStallRequest.DateTime;
                //    reportStall.Comentario = reportStallRequest.Remark;
                //    reportStall.Usuario = reportStallRequest.User;
                //}

                await db.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        
    }
}
