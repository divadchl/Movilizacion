using Elecciones.Models.DBSMovilizacion;
using Elecciones.Models.Models.Territory;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic.Security
{
    public class UserManager
    {

        private readonly string _userName;

        public List<KeyTerritorio> PermisosTerritorio { get; set; }

        public UserManager()
        {

        }

        public UserManager(string userName)
        {
            PermisosTerritorio = new List<KeyTerritorio>();
            _userName = userName;
        }

        public void LoadTerritorio()
        {
            using (var context = new DBDeteccionEntities())
            {
                var territoryList = context.Territorio.Where(t => t.UserName == _userName);
                var grupoTerritorio = new List<KeyTerritorio>();
                foreach (var territorio in territoryList)
                {
                    var currentProcess = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso);
                    var s = new { Territorio = territorio };
                    grupoTerritorio.Add(new KeyTerritorio(s.Territorio));

                    IQueryable<CATSecciones> secList = null;

                    if (territorio.IdMunicipio == null && territorio.IdDistritoFederal == null &&
                        territorio.IdDistritoLocal == null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado);
                    }
                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal != null &&
                       territorio.IdDistritoLocal != null && territorio.IdSeccion != null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal
                                                              && c.IdSeccion == territorio.IdSeccion);
                    }
                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal == null &&
                       territorio.IdDistritoLocal == null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio);
                    }

                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal != null &&
                        territorio.IdDistritoLocal == null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal);
                    }
                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal != null &&
                      territorio.IdDistritoLocal != null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    }
                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal == null &&
                      territorio.IdDistritoLocal != null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    }
                    else if (territorio.IdMunicipio != null && territorio.IdDistritoFederal == null &&
                      territorio.IdDistritoLocal == null && territorio.IdSeccion != null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdMunicipio == territorio.IdMunicipio
                                                              && c.IdSeccion == territorio.IdSeccion);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal != null &&
                       territorio.IdDistritoLocal != null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal != null &&
                     territorio.IdDistritoLocal == null && territorio.IdSeccion != null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal
                                                              && c.IdSeccion == territorio.IdSeccion);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal != null &&
                     territorio.IdDistritoLocal == null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdDistritoFederal == territorio.IdDistritoFederal);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal == null &&
                       territorio.IdDistritoLocal != null && territorio.IdSeccion != null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal
                                                              && c.IdSeccion == territorio.IdSeccion);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal == null &&
                     territorio.IdDistritoLocal != null && territorio.IdSeccion == null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    }
                    else if (territorio.IdMunicipio == null && territorio.IdDistritoFederal == null &&
                       territorio.IdDistritoLocal == null && territorio.IdSeccion != null)
                    {
                        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                                                              && c.IdSeccion == territorio.IdSeccion);
                    }


                    foreach (var sec in secList)
                    {
                        var newTerritory = new Territorio
                        {
                            IdEstado = sec.IdEstado,
                            IdMunicipio = sec.IdMunicipio,
                            IdDistritoFederal = sec.IdDistritoFederal,
                            IdDistritoLocal = sec.IdDistritoLocal,
                            IdSeccion = sec.IdSeccion,
                            IdProceso = territorio.IdProceso,
                            UserName = territorio.UserName,
                            CATEstado =  sec.CATEstado,
                            CATMunicipios = sec.CATMunicipios,
                            CATDistritoFederal = sec.CATDistritoFederal,
                            CATDistritoLocal = sec.CATDistritoLocal,
                            CATSecciones = sec,
                            DATProceso = currentProcess,
                            IdTerritorio = 0
                        };

                        var t = new { Territorio = newTerritory };
                        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));
                    }

                    //if (territorio.IdMunicipio != null)
                    //{
                    //    IQueryable<CATSecciones> secList = null;
                    //    if (territorio.IdDistritoFederal != null && territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal
                    //                                                && c.IdDistritoLocal == territorio.IdDistritoLocal
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdDistritoFederal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoLocal == territorio.IdDistritoLocal
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }

                    //    foreach (var sec in secList)
                    //    {
                    //        var newTerritory = new Territorio
                    //        {
                    //            IdEstado = sec.IdEstado,
                    //            IdMunicipio = sec.IdMunicipio,
                    //            IdDistritoFederal = sec.IdDistritoFederal,
                    //            IdDistritoLocal = sec.IdDistritoLocal,
                    //            IdSeccion = sec.IdSeccion,
                    //            IdProceso = territorio.IdProceso,
                    //            UserName = territorio.UserName,
                    //            CATEstado = context.CATEstado.FirstOrDefault(e => e.IdEstado == sec.IdEstado),
                    //            CATMunicipios = context.CATMunicipios.FirstOrDefault(e => e.IdMunicipio == sec.IdMunicipio),
                    //            CATDistritoFederal = context.CATDistritoFederal.FirstOrDefault(e => e.IdDistritoFederal == sec.IdDistritoFederal),
                    //            CATDistritoLocal = context.CATDistritoLocal.FirstOrDefault(e => e.IdDistritoLocal == sec.IdDistritoLocal),
                    //            CATSecciones = context.CATSecciones.FirstOrDefault(e => e.IdSeccion == sec.IdSeccion),
                    //            DATProceso = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso),
                    //            IdTerritorio = 0
                    //        };

                    //        var t = new { Territorio = newTerritory };
                    //        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));
                    //    }
                    //}

                    //if (territorio.IdDistritoFederal != null)
                    //{
                    //    IQueryable<CATSecciones> secList = null;
                    //    if (territorio.IdMunicipio != null && territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal
                    //                                                && c.IdDistritoLocal == territorio.IdDistritoLocal
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdMunicipio != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal
                    //                                                && c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoLocal == territorio.IdDistritoLocal
                    //                                                && c.IdDistritoFederal == territorio.IdDistritoFederal);
                    //    }
                    //    else
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado
                    //                                                && c.IdDistritoFederal == territorio.IdDistritoFederal);
                    //    }

                    //    foreach (var sec in secList)
                    //    {
                    //        var newTerritory = new Territorio
                    //        {
                    //            IdEstado = sec.IdEstado,
                    //            IdMunicipio = sec.IdMunicipio,
                    //            IdDistritoFederal = sec.IdDistritoFederal,
                    //            IdDistritoLocal = sec.IdDistritoLocal,
                    //            IdSeccion = sec.IdSeccion,
                    //            IdProceso = territorio.IdProceso,
                    //            UserName = territorio.UserName,
                    //            CATEstado = context.CATEstado.FirstOrDefault(e => e.IdEstado == sec.IdEstado),
                    //            CATMunicipios = context.CATMunicipios.FirstOrDefault(e => e.IdMunicipio == sec.IdMunicipio),
                    //            CATDistritoFederal = context.CATDistritoFederal.FirstOrDefault(e => e.IdDistritoFederal == sec.IdDistritoFederal),
                    //            CATDistritoLocal = context.CATDistritoLocal.FirstOrDefault(e => e.IdDistritoLocal == sec.IdDistritoLocal),
                    //            CATSecciones = context.CATSecciones.FirstOrDefault(e => e.IdSeccion == sec.IdSeccion),
                    //            DATProceso = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso),
                    //            IdTerritorio = 0
                    //        };

                    //        var t = new { Territorio = newTerritory };
                    //        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));
                    //    }
                    //}




                    //if (territorio.IdMunicipio == null)
                    //{
                    //    IQueryable<CATSecciones> secList = null;
                    //    if (territorio.IdDistritoFederal != null && territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    //    }
                    //    else if (territorio.IdDistritoFederal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoFederal == territorio.IdDistritoFederal);
                    //    }
                    //    else if (territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoLocal == territorio.IdDistritoLocal);
                    //    }
                    //    else
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado);
                    //    }

                    //    foreach (var sec in secList)
                    //    {
                    //        var newTerritory = new Territorio
                    //        {
                    //            IdEstado = sec.IdEstado,
                    //            IdMunicipio = sec.IdMunicipio,
                    //            IdDistritoFederal = sec.IdDistritoFederal,
                    //            IdDistritoLocal = sec.IdDistritoLocal,
                    //            IdSeccion = sec.IdSeccion,
                    //            IdProceso = territorio.IdProceso,
                    //            UserName = territorio.UserName,
                    //            CATEstado = context.CATEstado.FirstOrDefault(e => e.IdEstado == sec.IdEstado),
                    //            CATMunicipios = context.CATMunicipios.FirstOrDefault(e => e.IdMunicipio == sec.IdMunicipio),
                    //            CATDistritoFederal = context.CATDistritoFederal.FirstOrDefault(e => e.IdDistritoFederal == sec.IdDistritoFederal),
                    //            CATDistritoLocal = context.CATDistritoLocal.FirstOrDefault(e => e.IdDistritoLocal == sec.IdDistritoLocal),
                    //            CATSecciones = context.CATSecciones.FirstOrDefault(e => e.IdSeccion == sec.IdSeccion),
                    //            DATProceso = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso),
                    //            IdTerritorio = 0
                    //        };

                    //        var t = new { Territorio = newTerritory };
                    //        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));
                    //    }
                    //}
                    //if (territorio.IdDistritoFederal == null)
                    //{
                    //    IQueryable<CATSecciones> secList = null;
                    //    if (territorio.IdMunicipio != null && territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdMunicipio == territorio.IdMunicipio && c.IdDistritoLocal == territorio.IdDistritoLocal);
                    //    }
                    //    else if (territorio.IdMunicipio != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdDistritoLocal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoLocal == territorio.IdDistritoLocal);
                    //    }
                    //    else
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado);
                    //    }

                    //    foreach (var sec in secList)
                    //    {
                    //        var newTerritory = new Territorio
                    //        {
                    //            IdEstado = sec.IdEstado,
                    //            IdMunicipio = sec.IdMunicipio,
                    //            IdDistritoFederal = sec.IdDistritoFederal,
                    //            IdDistritoLocal = sec.IdDistritoLocal,
                    //            IdSeccion = sec.IdSeccion,
                    //            IdProceso = territorio.IdProceso,
                    //            UserName = territorio.UserName,
                    //            CATEstado = context.CATEstado.FirstOrDefault(e => e.IdEstado == sec.IdEstado),
                    //            CATMunicipios = context.CATMunicipios.FirstOrDefault(e => e.IdMunicipio == sec.IdMunicipio),
                    //            CATDistritoFederal = context.CATDistritoFederal.FirstOrDefault(e => e.IdDistritoFederal == sec.IdDistritoFederal),
                    //            CATDistritoLocal = context.CATDistritoLocal.FirstOrDefault(e => e.IdDistritoLocal == sec.IdDistritoLocal),
                    //            CATSecciones = context.CATSecciones.FirstOrDefault(e => e.IdSeccion == sec.IdSeccion),
                    //            DATProceso = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso),
                    //            IdTerritorio = 0
                    //        };

                    //        var t = new { Territorio = newTerritory };
                    //        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));

                    //    }
                    //}
                    //if (territorio.IdDistritoLocal == null)
                    //{
                    //    IQueryable<CATSecciones> secList = null;
                    //    if (territorio.IdMunicipio != null && territorio.IdDistritoFederal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdMunicipio == territorio.IdMunicipio && c.IdDistritoFederal == territorio.IdDistritoFederal);
                    //    }
                    //    else if (territorio.IdMunicipio != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdMunicipio == territorio.IdMunicipio);
                    //    }
                    //    else if (territorio.IdDistritoFederal != null)
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdDistritoLocal == territorio.IdDistritoFederal);
                    //    }
                    //    else
                    //    {
                    //        secList = context.CATSecciones.Where(c => c.IdEstado == territorio.IdEstado);
                    //    }

                    //    foreach (var sec in secList)
                    //    {
                    //        var newTerritory = new Territorio
                    //        {
                    //            IdEstado = sec.IdEstado,
                    //            IdMunicipio = sec.IdMunicipio,
                    //            IdDistritoFederal = sec.IdDistritoFederal,
                    //            IdDistritoLocal = sec.IdDistritoLocal,
                    //            IdSeccion = sec.IdSeccion,
                    //            IdProceso = territorio.IdProceso,
                    //            UserName = territorio.UserName,
                    //            CATEstado = context.CATEstado.FirstOrDefault(e => e.IdEstado == sec.IdEstado),
                    //            CATMunicipios = context.CATMunicipios.FirstOrDefault(e => e.IdMunicipio == sec.IdMunicipio),
                    //            CATDistritoFederal = context.CATDistritoFederal.FirstOrDefault(e => e.IdDistritoFederal == sec.IdDistritoFederal),
                    //            CATDistritoLocal = context.CATDistritoLocal.FirstOrDefault(e => e.IdDistritoLocal == sec.IdDistritoLocal),
                    //            CATSecciones = context.CATSecciones.FirstOrDefault(e => e.IdSeccion == sec.IdSeccion),
                    //            DATProceso = context.DATProceso.FirstOrDefault(e => e.IdProceso == territorio.IdProceso),
                    //            IdTerritorio = 0
                    //        };

                    //        var t = new { Territorio = newTerritory };
                    //        grupoTerritorio.Add(new KeyTerritorio(t.Territorio));
                    //    }
                    //}
                }


                PermisosTerritorio.AddRange(grupoTerritorio);
            }
        }

    }
}
