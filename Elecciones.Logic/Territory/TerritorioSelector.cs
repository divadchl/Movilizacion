using Elecciones.Common.Models.Territory;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Models.Models.Territory;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic.Territory
{
    public class TerritorioSelector
    {
        public string UserName { get; set; }

        public TerritorioSelector()
        {
        }

        public TerritorioSelector(string userName)
        {
            UserName = userName;
        }

        public VDummy BringsEstadosFather()
        {
            var manager = new UserManager(UserName);
            manager.LoadTerritorio();

            using (var ctx = new DBDeteccionEntities())
            {
                var dummy = new VDummy
                {
                    Descripcion = "Estado",
                    Lista = new List<VDummy>(),
                    TipoTerritorio = ETerritorioOrder.TerritorioOrder.Estado
                };
                var edos = ctx.CATEstado.ToList().Select(d => new TerritorioDataManager(new List<ITerritorio> { new VEstado(d) })).ToList();
                var goodEdos = edos.Where(s => manager.PermisosTerritorio.Any(d => d.Territorio.Belong(s)));
                dummy.Lista = goodEdos.SelectMany(s => s.Territorios).Where(s => s.Key == ETerritorioOrder.TerritorioOrder.Estado).Select(s => new VDummy(s.Value)).ToList();
                return dummy;
            }
        }

        public VDummy BringsTerritoryFather(List<VDummy> stack, ETerritorioOrder.TerritorioOrder tipo)
        {
            var manager = new UserManager(UserName);
            manager.LoadTerritorio();

            var result = new VDummy();
            var currentTerritory = new TerritorioDataManager(stack.Select(s => s.GetEntity()));

            IEnumerable<TerritorioDataManager> territorio;

            switch (tipo)
            {
                case ETerritorioOrder.TerritorioOrder.Municipio:
                    result.Descripcion = "Municipio";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.Municipio;
                    result.Lista = new List<VDummy>();

                    var muns = currentTerritory.Municipios;

                    territorio = muns.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    //if (stack.Count > 1)
                    //{
                    territorio = territorio.Where(s => manager.PermisosTerritorio.Select(p => p.Territorio).Any(s.Belong));
                    // }
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.Municipio).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.DistritoFederal:
                    result.Descripcion = "Distrito Federal";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.DistritoFederal;
                    result.Lista = new List<VDummy>();
                    
                    var dfed = currentTerritory.DistritoFederal;
                    territorio = dfed.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    //if (stack.Count > 1)
                    //{
                    territorio = territorio.Where(s => manager.PermisosTerritorio.Select(p => p.Territorio).Any(s.Belong));
                    //}
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.DistritoFederal).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.DistritoLocal:
                    result.Descripcion = "Distrito Local";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.DistritoLocal;
                    result.Lista = new List<VDummy>();

                    var dloc = currentTerritory.DistritoLocal.OrderBy(t => int.Parse(t.Descripcion));
                    territorio = dloc.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    //if (stack.Count > 1)
                    //{
                    territorio = territorio.Where(s => manager.PermisosTerritorio.Select(p => p.Territorio).Any(s.Belong));
                    //}
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.DistritoLocal).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.Seccion:
                    result.Descripcion = "Seccion";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.Seccion;
                    result.Lista = new List<VDummy>();

                    var sec = currentTerritory.Secciones;
                    territorio = sec;
                    territorio = territorio.Where(s => manager.PermisosTerritorio.Select(p => p.Territorio).Any(s.Belong));
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.Seccion).Select(
                                s => new VDummy(s.Value)).OrderBy(d => int.Parse(d.Descripcion)).ToList();
                    break;
            }

            return result;
        }

        public VDummy BringsTerritoryFatherInAdmin(List<VDummy> stack, ETerritorioOrder.TerritorioOrder tipo)
        {
            var result = new VDummy();
            var currentTerritory = new TerritorioDataManager(stack.Select(s => s.GetEntity()));

            IEnumerable<TerritorioDataManager> territorio;

            switch (tipo)
            {
                case ETerritorioOrder.TerritorioOrder.Municipio:
                    result.Descripcion = "Municipio";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.Municipio;
                    result.Lista = new List<VDummy>();

                    var muns = currentTerritory.Municipios;

                    territorio = muns.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.Municipio).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.DistritoFederal:
                    result.Descripcion = "Distrito Federal";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.DistritoFederal;
                    result.Lista = new List<VDummy>();

                    var dfed = currentTerritory.DistritoFederal;
                    territorio = dfed.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.DistritoFederal).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.DistritoLocal:
                    result.Descripcion = "Distrito Local";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.DistritoLocal;
                    result.Lista = new List<VDummy>();

                    var dloc = currentTerritory.DistritoLocal.OrderBy(t => int.Parse(t.Descripcion));
                    territorio = dloc.Select(s =>
                    {
                        var list = new List<ITerritorio> { s };
                        list.AddRange(currentTerritory.Territorios.Select(c => c.Value));
                        return new TerritorioDataManager(list);
                    });
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.DistritoLocal).Select(
                                s => new VDummy(s.Value)).ToList();
                    break;
                case ETerritorioOrder.TerritorioOrder.Seccion:
                    result.Descripcion = "Seccion";
                    result.TipoTerritorio = ETerritorioOrder.TerritorioOrder.Seccion;
                    result.Lista = new List<VDummy>();

                    var sec = currentTerritory.Secciones;
                    territorio = sec;
                    result.Lista =
                        territorio.SelectMany(s => s.Territorios).Where(
                            s => s.Key == ETerritorioOrder.TerritorioOrder.Seccion).Select(
                                s => new VDummy(s.Value)).OrderBy(d => int.Parse(d.Descripcion)).ToList();
                    break;
            }

            return result;
        }

        public string GetMunicipioXSeccion(int secc)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var seccion = ctx.CATSecciones.FirstOrDefault(s => s.IdSeccion == secc);
                return seccion == null ? "NO EXISTE UN MUNICIPIO ASOSICADO A ESA SECCIÓN" : seccion.CATMunicipios.descripcion;
            }
        }

        public string GetEstadoName(int edo)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var estado = ctx.CATEstado.First(d => d.IdEstado == edo);
                return estado.Nombre;
            }
        }

    }
}
