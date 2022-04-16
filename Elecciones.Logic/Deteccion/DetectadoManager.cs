using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Detectado;
using Elecciones.Common.Models.Territory;
using Elecciones.Common.Requests;
using Elecciones.Logic.Security;
using Elecciones.Logic.Services;
using Elecciones.Logic.Territory;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Elecciones.Logic.Deteccion
{
    public class DetectadoManager
    {
        private bool isProcessByAdmin = false;
        private ProcesoModel proceso;
        private string userName;
        private TerritorioFilter filter;
        public DetectadoManager(bool isProcessByAdmin, string userName, ProcesoModel proceso)
        {
            this.isProcessByAdmin = isProcessByAdmin;
            this.proceso = proceso;
            this.userName = userName;
            this.filter = new TerritorioFilter(userName, proceso);
        }

        public List<DetectadoDto> GetPersonList(List<VCriteria> criteria, Guid process)
        {
            using (var context = new DBDeteccionEntities())
            {
                var terBuilder = new ExpressionBuilder<DATPersonas>();
                criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
                var builder = new ExpressionBuilder<DetectadoDto>();
                criteria.Where(c => !c.PropertyName.StartsWith("Id")).ToList().ForEach(s => builder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));

                var func = terBuilder.TransformExpression();

                var datPerson = isProcessByAdmin
                    ? context.DATPersonas.Where(func).Where(c => c.IdProceso == proceso.Id)
                    : context.DATPersonas.Where(func).Where(c => c.IdProceso == proceso.Id).Where(p => filter.Estados.Contains(p.IdEstado.Value) &&
                                                     filter.Municipios.Contains(p.IdMunicipio.Value) &&
                                                     filter.DistritosFederales.Contains(p.IdDistritoFederal.Value) &&
                                                     filter.DistritosLocales.Contains(p.IdDistritoLocal.Value) &&
                                                     filter.Secciones.Contains(p.IdSeccion.Value));

                var electoralData = datPerson?.Select(s => new DetectadoDto
                {
                    IdPersona = s.IdPersona,
                    Nombre = s.Nombre,
                    Paterno = s.Paterno,
                    Materno = s.Materno,
                    Estado = s.CATEstado.Nombre,
                    Municipio = s.CATMunicipios.descripcion,
                    INE = s.ClaveINE,
                    Latitud = s.Latitud,
                    Longitud = s.Longitud,
                    Seccion = s.CATSecciones.Seccion.ToString(),
                    DistritoFederal = s.CATDistritoFederal.DistritoFederal.ToString(),
                    DistritoLocal = s.CATDistritoLocal.DistritoLocal.ToString(),
                    Calle = s.Calle,
                    Colonia = s.Colonia,
                    CodigoPostal = s.CP,
                    NoInterior = s.NoInterior,
                    NoExterior = s.NoExterior,
                    Vigente = s.Vigente,
                    DomiciliosAdicionales = s.DATDomicilios.Select(d => new AddressDto
                    {
                        Direccion = d.Calle,
                        Colonia = d.Colonia,
                        CodigoPostal = d.CP,
                        Municipio = d.CATMunicipios.descripcion,
                        Estado = d.CATEstado.Nombre,
                        NumeroExterior = d.NoExterior,
                        NumeroInterior = d.NoInterior,
                        Latitud = d.Latitud,
                        Longitud = d.Longitud,
                        IdPersona = s.IdPersona
                    }),
                    Contactos = s.DATContacto.Where(d => d.IdProceso == proceso.Id).OrderByDescending(d => d.FechaHora).Select(d => new ContactDto
                    {
                        IdPersona = d.IdPersona,
                        Nombre = d.DATPersonas.Nombre,
                        Paterno = d.DATPersonas.Paterno,
                        Materno = d.DATPersonas.Materno,
                        Estado = d.DATPersonas.CATEstado.Nombre,
                        Municipio = d.DATPersonas.CATMunicipios.descripcion,
                        INE = d.DATPersonas.ClaveINE,
                        Latitud = d.DATPersonas.Latitud,
                        Longitud = d.DATPersonas.Longitud,
                        Seccion = d.DATPersonas.CATSecciones.Seccion.ToString(),
                        DistritoFederal = d.DATPersonas.CATDistritoFederal.DistritoFederal.ToString(),
                        DistritoLocal = d.DATPersonas.CATDistritoLocal.DistritoLocal.ToString(),
                        Calle = d.DATPersonas.Calle,
                        Colonia = d.DATPersonas.Colonia,
                        CodigoPostal = d.DATPersonas.CP,
                        NoInterior = d.DATPersonas.NoInterior,
                        NoExterior = d.DATPersonas.NoExterior,
                        DomiciliosAdicionales = d.DATPersonas.DATDomicilios.Select(dom => new AddressDto
                        {
                            Direccion = dom.Calle,
                            Colonia = dom.Colonia,
                            CodigoPostal = dom.CP,
                            Municipio = dom.CATMunicipios.descripcion,
                            Estado = dom.CATEstado.Nombre,
                            NumeroExterior = dom.NoExterior,
                            NumeroInterior = dom.NoInterior,
                            Latitud = dom.Latitud,
                            Longitud = dom.Longitud,
                            IdPersona = dom.IdPersona
                        }),
                        IdContacto = d.IdContacto,
                        Voto = d.Voto,
                        IdTipoContacto = d.IdTipoContacto,
                        TipoContacto = d.CATTipoContacto.TipoContacto,
                        Color = d.CATTipoContacto.Color,
                        Estatus = d.CATTipoContacto.TipoContacto
                    })
                }).OrderBy(p => p.Nombre).ThenBy(p => p.Paterno).ThenBy(p => p.Materno).ToList();//.Skip(count).Take(100).ToList();


                foreach (var data in electoralData)
                {
                    var contactList = context.DATContacto.Where(c => c.IdPersona == data.IdPersona).OrderByDescending(f => f.FechaHora);
                    if (contactList != null && contactList.Any())
                    {
                        var s = contactList.First();
                        data.Estatus = s.CATTipoContacto.TipoContacto;
                        data.Color = s.CATTipoContacto.Color;
                    }
                    else
                    {
                        data.Estatus = "No contactado";
                        data.Color = "Azul";
                    }
                }


                return electoralData;
            }
        }

        public bool ExistsIneRegister(string ine)
        {
            using (var context = new DBDeteccionEntities())
            {
                return context.DATPersonas.Any(p => p.IdProceso == proceso.Id && p.ClaveINE.Trim().Equals(ine.Trim(), StringComparison.CurrentCultureIgnoreCase));
            }
        }

        public bool SaveNewPerson(PersonaIne person)
        {
            using (var context = new DBDeteccionEntities())
            {
                var ineFrontArray = Convert.FromBase64String(person.IneFront.Split(new string[] { "base64," }, StringSplitOptions.None)[1]);
                var ineBackArray = Convert.FromBase64String(person.IneBack.Split(new string[] { "base64," }, StringSplitOptions.None)[1]);

                var persona = new DATPersonas
                {
                    IdPersona = Guid.NewGuid(),
                    Paterno = person.ApellidoPaterno,
                    Materno = person.ApellidoMaterno,
                    Nombre = person.Nombre,
                    Calle = person.Calle,
                    Colonia = person.Colonia,
                    CP = person.CP,
                    Estado = person.Estado,
                    Municipio = person.Municipio,
                    ClaveINE = person.ClaveElector,
                    CURP = person.CURP,
                    NoEstado = person.NoEstado,
                    NoMunicipio = person.NoMunicipio,
                    Seccion = person.Seccion,
                    Emision = person.Emision,
                    Vigencia = person.Vigencia,
                    CIC = person.CIC,
                    RegistroINE = person.AñoRegistro,
                    NoEmision = person.NumEmision,
                    Usuario = userName,
                    FechaRegistro = DateTime.Now,
                    IdTipoCredencial = person.IneType,
                    IdProceso = proceso.Id
                };

                context.DATPersonas.Add(persona);
                context.SaveChanges();

                var idIneFront = Guid.NewGuid();
                var doctoIneFront = new DATDoctoPersona
                {
                    IdDoctoPersona = idIneFront,
                    IdPersona = persona.IdPersona,
                    IdTipoDocumento = 1,
                    Documento = ineFrontArray,
                    FechaRegistro = DateTime.Now,
                    Nombre = "ine_frente_" + idIneFront.ToString() + ".jpg"
                };
                context.DATDoctoPersona.Add(doctoIneFront);

                var idIneBack = Guid.NewGuid();
                var doctoIneBack = new DATDoctoPersona
                {
                    IdDoctoPersona = idIneBack,
                    IdPersona = persona.IdPersona,
                    IdTipoDocumento = 2,
                    Documento = ineBackArray,
                    FechaRegistro = DateTime.Now,
                    Nombre = "ine_atras_" + idIneBack.ToString() + ".jpg"
                };
                context.DATDoctoPersona.Add(doctoIneBack);

                context.SaveChanges();
                return true;

            }
        }

        public async Task<(Credential, string)> LoadIneInformation(int type, string ineFront, string ineBack)
        {
            var recognizer = new FormRecognizerService();
            var ineFrontArray = Convert.FromBase64String(ineFront.Split(new string[] { "base64," }, StringSplitOptions.None)[1]);
            var ineBackArray = Convert.FromBase64String(ineBack.Split(new string[] { "base64," }, StringSplitOptions.None)[1]);

            var credentialRequest = new CredentialRequest
            {
                ImageFront = ineFrontArray,
                ImageBack = ineBackArray
            };

            switch (type)
            {
                case 1:
                    return await recognizer.RecognizeContentTypeC(credentialRequest, false);
                case 2:
                    return await recognizer.RecognizeContentTypeDEF(credentialRequest, false);
                case 3:
                    return await recognizer.RecognizeContentTypeGH(credentialRequest, false);
                default:
                    break;
            }
            throw new NotImplementedException();
        }

        public DetailPersonDto GetContact(Guid personId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var person = context.DATPersonas.FirstOrDefault(p => p.IdPersona == personId);
                if (person != null)
                {
                    var detailPerson = new DetailPersonDto
                    {
                        IdPersona = personId,
                        Nombre = person.Nombre,
                        Materno = person.Materno,
                        Paterno = person.Paterno,
                        Invitados = person?.DATInvitados?.Select(g => new GuestDto
                        {
                            GuestId = g.IdInvitado,
                            Name = g.Nombre,
                            Location = "CDMX"
                        }).ToList(),
                        Telefono = person?.UsersDeteccion?.Telefono,
                        Correo = person?.UsersDeteccion?.email
                    };

                    detailPerson.Invitados.ForEach(inv =>
                    {
                        if (context.DATPersonas.Any(p => p.IdInvitado == inv.GuestId))
                        {
                            var invitado = context.DATPersonas.First(p => p.IdInvitado == inv.GuestId);
                            if (invitado.UsersDeteccion != null)
                            {
                                inv.IsRegistered = invitado.UsersDeteccion.isRegister ?? false;
                            }
                        }
                    });

                    detailPerson.Domicilios = new List<AddressDto>
                    {
                        new AddressDto
                        {
                            Direccion = person.Calle,
                            Municipio = person.CATMunicipios.descripcion,
                            Latitud = person.Latitud,
                            Longitud = person.Longitud,
                            Seccion = person.CATSecciones.Seccion.ToString(),
                            DistritoFederal = person.CATDistritoFederal.DistritoFederal.ToString(),
                            DistritoLocal = person.CATDistritoLocal.DistritoLocal.ToString(),
                            CodigoPostal = person.CP,
                            Colonia = person.Colonia,
                            Estado = person.CATEstado.Nombre,
                            NumeroExterior = person.NoExterior,
                            NumeroInterior = person.NoInterior,
                            IdPersona = personId
                        }
                    };

                    detailPerson.Domicilios.AddRange(person.DATDomicilios.Select(d => new AddressDto
                    {
                        Direccion = d.Calle,
                        Colonia = d.Colonia,
                        CodigoPostal = d.CP,
                        Municipio = d.CATMunicipios.descripcion,
                        Estado = d.CATEstado.Nombre,
                        NumeroExterior = d.NoExterior,
                        NumeroInterior = d.NoInterior,
                        Latitud = d.Latitud,
                        Longitud = d.Longitud,
                        IdPersona = personId
                    }));

                    var frontIne = person.DATDoctoPersona.FirstOrDefault(d => d.IdTipoDocumento == 1);
                    var backIne = person.DATDoctoPersona.FirstOrDefault(d => d.IdTipoDocumento == 2);
                    if (frontIne != null)
                    {
                        detailPerson.CredencialFrente = Convert.ToBase64String(frontIne.Documento);
                    }
                    if (backIne != null)
                    {
                        detailPerson.CredencialAtras = Convert.ToBase64String(backIne.Documento);
                    }
                    return detailPerson;
                }
                else
                {
                    return new DetailPersonDto();
                }
            }
        }

        public List<BoxDto> GetBoxesList(Guid process, List<VCriteria> criteria)
        {
            var proceso = ProcesoManager.GetProcesoById(process);

            var terBuilder = new ExpressionBuilder<Casillas>();
            criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
            var func = terBuilder.TransformExpression();

            using (var context = new DBDeteccionEntities())
            {
                var data = isProcessByAdmin
                ? context.Casillas.Where(func).Where(c => c.IdEncarte == proceso.IdEncarte)
                : context.Casillas.Where(func).Where(c => c.IdEncarte == proceso.IdEncarte).Where(p => filter.Estados.Contains(p.IdEstado.Value) &&
                                                     filter.Municipios.Contains(p.IdMunicipio.Value) &&
                                                     filter.DistritosFederales.Contains(p.IdDistritoFederal.Value) &&
                                                     filter.Secciones.Contains(p.IdSeccion.Value));

                return data.Select(s => new BoxDto
                {
                    IdCasilla = s.IdCasilla,
                    Casilla = s.casilla,
                    Domicilio = s.domicilio,
                    Referencia = s.referencia,
                    Ubicacion = s.ubicacion,
                    Latitud = s.latitud,
                    Longitud = s.logitud,
                    IdTipoCasilla = s.IdTipoCasilla,
                    TipoCasilla = s.CATTipoCasilla.Descripcion,
                    IdEstado = s.CATEstado.IdEstado,
                    Estado = s.CATEstado.Nombre,
                    IdMunicipio = s.CATMunicipios.IdMunicipio,
                    Municipio = s.CATMunicipios.descripcion,
                    IdDistritoFederal = s.CATDistritoFederal.IdDistritoFederal,
                    DistritoFederal = s.CATDistritoFederal.DistritoFederal,
                    IdDistritoLocal = s.CATSecciones.CATDistritoLocal.IdDistritoLocal,
                    DistritoLocal = s.CATSecciones.CATDistritoLocal.DistritoLocal,
                    IdSeccion = s.CATSecciones.IdSeccion,
                    Seccion = s.CATSecciones.Seccion,
                    ReporteCasilla = s.DATReporteCasilla.Where(d => d.IdProceso == proceso.Id).Select(c => new BoxReportDto
                    {
                        IdCasilla = c.IdCasilla,
                        IdEstatusCasilla = c.IdEstatusCasilla,
                        EstatusCasilla = c.CATEstatusCasilla.EstatusCasilla,
                        ColorEstatusCasilla = c.CATEstatusCasilla.Color,
                        Comentario = c.Comentario,
                        Fecha = c.FechaHora
                    }).OrderByDescending(c => c.Fecha).ToList()
                }).ToList();//.Skip(count).Take(100).ToList();
            }
        }

        public CredentialDto GetImageIne(Guid personId, int documentType)
        {
            using (var context = new DBDeteccionEntities())
            {
                var person = context.DATPersonas.FirstOrDefault(p => p.IdPersona == personId);
                if (person != null)
                {
                    var file = context.DATDoctoPersona.FirstOrDefault(d => d.IdTipoDocumento == documentType);
                    if (file != null)
                    {
                        return new CredentialDto
                        {
                            Name = file.Nombre,
                            Photo = file.Documento
                        };
                    }
                }
                return null;
            }
        }

        /*
        public static List<DATPersonas> GetPersonas(int? start, int? length, string searchDetail, int? orderColumn, string orderDirection, out int totalRecords, out int filteredRecords, Guid process, List<VCriteria> criteria)
        {
            totalRecords = 0;
            filteredRecords = 0;
            var proceso = ProcesoManager.GetProcesoById(process);

            var terBuilder = new ExpressionBuilder<Casillas>();
            criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
            var func = terBuilder.TransformExpression();

            try
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var data = isProcessByAdmin
                ? ctx.Casillas.Where(func).Where(c => c.IdEncarte == proceso.IdEncarte)
                : ctx.Casillas.Where(func).Where(c => c.IdEncarte == proceso.IdEncarte).Where(p => filter.Estados.Contains(p.IdEstado.Value) &&
                                                     filter.Municipios.Contains(p.IdMunicipio.Value) &&
                                                     filter.DistritosFederales.Contains(p.IdDistritoFederal.Value) &&
                                                     filter.Secciones.Contains(p.IdSeccion.Value));

                    var personas = ctx.DATPersonas.AsQueryable();

                    totalRecords = personas.Count();

                    if (!string.IsNullOrWhiteSpace(searchDetail))
                    {
                        personas = personas.Where(p => p.RFC.Contains(searchDetail) ||
                                             SqlFunctions.StringConvert((double)p.CodPersona).Contains(searchDetail) ||
                                             p.Completo.Contains(searchDetail) ||
                                             p.RNM.Contains(searchDetail) ||
                                             p.ClaveINE.Contains(searchDetail) ||
                                             p.Afinidades.Contains(searchDetail));
                    }

                    filteredRecords = personas.Count();

                    if (string.Compare("asc", orderDirection) == 0)
                    {
                        switch (orderColumn)
                        {
                            case 0: personas = personas.OrderBy(p => p.RFC); break;
                            case 1: personas = personas.OrderBy(p => p.CodPersona); break;
                            case 2: personas = personas.OrderBy(p => p.Completo); break;
                            case 3: personas = personas.OrderBy(p => p.RNM); break;
                            case 4: personas = personas.OrderBy(p => p.ClaveINE); break;
                        }
                    }
                    else
                    {
                        switch (orderColumn)
                        {
                            case 0: personas = personas.OrderByDescending(p => p.RFC); break;
                            case 1: personas = personas.OrderByDescending(p => p.CodPersona); break;
                            case 2: personas = personas.OrderByDescending(p => p.Completo); break;
                            case 3: personas = personas.OrderByDescending(p => p.RNM); break;
                            case 4: personas = personas.OrderByDescending(p => p.ClaveINE); break;
                        }
                    }

                    if ((start ?? -1) > -1)
                        personas = personas.Skip(start ?? 0).Take(length ?? 0).AsQueryable();

                    return personas.AsEnumerable()
                                .Select(p => new DATPersonas
                                {
                                    IdPersona = p.IdPersona,
                                    sCodPersona = p.CodPersona.ToString("000000"),
                                    RFC = p.RFC,
                                    APaterno = p.APaterno,
                                    AMaterno = p.AMaterno,
                                    Nombres = p.Nombres,
                                    Completo = p.Completo,
                                    RNM = p.RNM,
                                    ClaveINE = p.ClaveINE,
                                    IdEstado = p.IdEstado,
                                    IdMunicipio = p.IdMunicipio,
                                    Calle = p.Calle,
                                    Colonia = p.Colonia,
                                    NoExterior = p.NoExterior,
                                    NoInterior = p.NoInterior,
                                    CP = p.CP,
                                    Afinidades = p.Afinidades
                                }).ToList();
                }
            }
            catch (Exception ex)
            {
                var x = ex.Message;
                return null;
            }
        }*/

        #region Temporal
        public List<BoxDto> GetBoxes(int? start, int? length, string searchDetail, int? orderColumn, string orderDirection, out int totalRecords, out int filteredRecords, Guid process, int? state, int? municipality, int? federalDistrict, int? localDistrict, int? section)
        {
            totalRecords = 0;
            filteredRecords = 0;

            try
            {
                using (var context = new DBDeteccionEntities())
                {
                    var boxes = context.Casillas.AsQueryable();

                    totalRecords = boxes.Count();

                    if(state != null)
                    {
                        boxes = boxes.Where(b => b.IdEstado == state);
                    }
                    if (municipality != null)
                    {
                        boxes = boxes.Where(b => b.IdMunicipio == municipality);
                    }
                    if (federalDistrict != null)
                    {
                        boxes = boxes.Where(b => b.IdDistritoFederal == federalDistrict);
                    }
                    if (section != null)
                    {
                        boxes = boxes.Where(b => b.IdSeccion == section);
                    }

                    if (!string.IsNullOrWhiteSpace(searchDetail))
                    {
                        boxes = boxes.Where(p => p.nmunicipio.Contains(searchDetail) ||
                                             p.domicilio.Contains(searchDetail) ||
                                             p.ubicacion.Contains(searchDetail));
                    }

                    filteredRecords = boxes.Count();

                    if (string.Compare("asc", orderDirection) == 0)
                    {
                        switch (orderColumn)
                        {
                            case 0: boxes = boxes.OrderBy(p => p.nmunicipio); break;
                            case 1: boxes = boxes.OrderBy(p => p.domicilio); break;
                            case 2: boxes = boxes.OrderBy(p => p.ubicacion); break;
                        }
                    }
                    else
                    {
                        switch (orderColumn)
                        {
                            case 0: boxes = boxes.OrderByDescending(p => p.nmunicipio); break;
                            case 1: boxes = boxes.OrderByDescending(p => p.domicilio); break;
                            case 2: boxes = boxes.OrderByDescending(p => p.ubicacion); break;
                        }
                    }

                    if ((start ?? -1) > -1)
                        boxes = boxes.Skip(start ?? 0).Take(length ?? 0).AsQueryable();

                    var tmp= boxes.AsEnumerable()
                                .Select(b => new BoxDto
                                {
                                    IdCasilla = b.IdCasilla,
                                    Casilla = b.casilla,
                                    Domicilio = b.domicilio,
                                    Referencia = b.referencia,
                                    Ubicacion = b.ubicacion,
                                    Latitud = b.latitud,
                                    Longitud = b.logitud,
                                    IdTipoCasilla = b.IdTipoCasilla,
                                    TipoCasilla = b.CATTipoCasilla.Descripcion,
                                    IdEstado = b.CATEstado.IdEstado,
                                    Estado = b.CATEstado.Nombre,
                                    IdMunicipio = b.CATMunicipios.IdMunicipio,
                                    Municipio = b.CATMunicipios.descripcion,
                                    IdDistritoFederal = b.CATDistritoFederal.IdDistritoFederal,
                                    DistritoFederal = b.CATDistritoFederal.DistritoFederal,
                                    IdDistritoLocal = b.CATSecciones.CATDistritoLocal.IdDistritoLocal,
                                    DistritoLocal = b.CATSecciones.CATDistritoLocal.DistritoLocal,
                                    IdSeccion = b.CATSecciones.IdSeccion,
                                    Seccion = b.CATSecciones.Seccion,
                                    ReporteCasilla = b.DATReporteCasilla.Where(d => d.IdProceso == proceso.Id).Select(c => new BoxReportDto
                                    {
                                        IdCasilla = c.IdCasilla,
                                        IdEstatusCasilla = c.IdEstatusCasilla,
                                        EstatusCasilla = c.CATEstatusCasilla.EstatusCasilla,
                                        ColorEstatusCasilla = c.CATEstatusCasilla.Color,
                                        Comentario = c.Comentario,
                                        Fecha = c.FechaHora
                                    }).OrderByDescending(c => c.Fecha).ToList()
                                }).ToList();
                    return tmp;
                }
            }
            catch (Exception ex)
            {
                var x = ex.Message;
                return null;
            }
        }
        #endregion

    }
}
