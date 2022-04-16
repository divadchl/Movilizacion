using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic
{
    public static class TerritorioManager
    {
        public static List<TerritorioModel> GetEstados()
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CATEstado
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: p.IdEstado, name: p.Nombre, shortName: p.Abreviacion)).ToList();
            }
        }

        public static TerritorioModel GetEstado(int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var st = ctx.CATEstado.FirstOrDefault(p => p.IdEstado == IdEstado);
                if (st != null)
                    return new TerritorioModel(idEstado: st.IdEstado, name: st.Nombre, shortName: st.Abreviacion);
                return null;
            }
        }


        public static List<TerritorioModel> GetMunicipios(int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CATMunicipios
                    .Where(p => p.IdEstado == IdEstado)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idMunicipio: p.IdMunicipio, name: p.descripcion)).ToList();
            }
        }

        public static List<TerritorioModel> GetMunicipios(int IdEncarte, int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CatDistritoFederalMunicipio
                    .Where(p => p.IdEstado == IdEstado && p.IdEncarte == IdEncarte)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idMunicipio: p.IdMunicipio)).ToList();
            }
        }

        public static List<TerritorioModel> GetMunicipios(int IdEncarte, int IdEstado, int IdDistritoFederal)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CatDistritoFederalMunicipio
                    .Where(p => p.IdEstado == IdEstado && p.IdDistritoFederal == IdDistritoFederal && p.IdEncarte == IdEncarte)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idMunicipio: p.IdMunicipio)).ToList();
            }
        }

        internal static TerritorioModel GetMunicipio(int IdMunicipio)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var mn = ctx.CATMunicipios.FirstOrDefault(p => p.IdMunicipio == IdMunicipio);
                if (mn != null)
                    return new TerritorioModel(idEstado: mn.IdEstado.Value, idMunicipio: mn.IdMunicipio, name: mn.descripcion);
                return null;
            }
        }

        //public static List<TupleModel> GetCodigosPostales(int IdEstado, int IdMunicipio)
        //{
        //    using (var ctx = new DBDeteccionEntities())
        //    {
        //        return ctx.CatCP
        //            .Where(p => p.IdEstado == IdEstado && p.IdMunicipio == IdMunicipio)
        //            .AsEnumerable()
        //            .Select(p => new TupleModel { Id = p.IdCP, Name = p.CP }).ToList();
        //    }
        //}

        public static TerritorioModel GetDistritoFederal(int IdDistritoFederal)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var df = ctx.CATDistritoFederal.FirstOrDefault(p => p.IdDistritoFederal == IdDistritoFederal);
                if (df != null)
                    return new TerritorioModel(idEstado: df.IdEstado, idDistritoFederal: df.IdDistritoFederal, name: df.DistritoFederal.ToString());
                return null;
            }
        }

        public static List<TerritorioModel> GetDistritosFederales(int IdEncarte, int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CATDistritoFederal
                    .Where(p => p.IdEncarte == IdEncarte && p.IdEstado == IdEstado)
                    .AsEnumerable()
                    .OrderBy(p => p.IdDistritoFederal)
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idDistritoFederal: p.IdDistritoFederal, name: p.DistritoFederal.ToString())).ToList();
            }
        }

        public static List<TerritorioModel> GetDistritosFederales(int IdEncarte, int IdEstado, int IdMunicipio)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CatDistritoFederalMunicipio
                    .Where(p => p.IdEstado == IdEstado && p.IdMunicipio == IdMunicipio && p.IdEncarte == IdEncarte)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idDistritoFederal: p.IdDistritoFederal)).ToList();
            }
        }
        public static List<TerritorioModel> GetDistritosFederalesEstado(int IdEncarte, int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CATDistritoFederal
                    .Where(p => p.IdEstado == IdEstado && p.IdEncarte == IdEncarte)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idDistritoFederal: p.IdDistritoFederal)).Distinct().ToList();
            }
        }
        public static List<TerritorioModel> Secciones(int IdEncarte, int IdEstado, int? IdDistritoFederal, int? IdMunicipio)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var secciones = ctx.CATSecciones
                    .Where(p => p.IdEncarte == IdEncarte && p.IdEstado == IdEstado).AsQueryable();
                if (IdDistritoFederal.HasValue)
                    secciones = secciones.Where(p => p.IdDistritoFederal == IdDistritoFederal).AsQueryable();
                if (IdMunicipio.HasValue)
                    secciones = secciones.Where(p => p.IdMunicipio == IdMunicipio).AsQueryable();

                return secciones.AsEnumerable()
                    .Select(p => new TerritorioModel(
                    idEstado: IdEstado,
                    idDistritoFederal: IdDistritoFederal,
                    idMunicipio: IdMunicipio,
                    idSeccion: p.IdSeccion,
                    name: p.Seccion.ToString()
                    )).ToList();
            }
        }

        public static TerritorioModel GetDistritoLocal(int IdDistritoLocal)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var df = ctx.CATDistritoLocal.FirstOrDefault(p => p.IdDistritoLocal == IdDistritoLocal);
                if (df != null)
                    return new TerritorioModel(idEstado: df.IdEstado, idDistritoLocal: df.IdDistritoLocal, name: df.DistritoLocal.ToString());
                return null;
            }
        }

        public static TerritorioModel GetTerritorio(int id)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var terr = ctx.Territorio.FirstOrDefault(p => p.IdTerritorio == id);
                if (terr != null)
                    return new TerritorioModel(terr);
                return null;
            }
        }

        public static bool Delete(int IdTerritorio)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var territorio = ctx.Territorio.FirstOrDefault(p => p.IdTerritorio == IdTerritorio);
                if (territorio != null)
                {
                    ctx.Territorio.Remove(territorio);
                    ctx.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public static List<TerritorioModel> GetDistritosLocales(int IdEncarte, int IdEstado)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.CATDistritoLocal
                    .Where(p => p.IdEncarte == IdEncarte && p.IdEstado == IdEstado)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(idEstado: IdEstado, idDistritoLocal: p.IdDistritoLocal, name: p.DistritoLocal.ToString())).ToList();
            }
        }

        internal static TerritorioModel GetSeccion(int IdSeccion)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var s = ctx.CATSecciones.FirstOrDefault(p => p.IdSeccion == IdSeccion);
                if (s != null)
                    return new TerritorioModel(idEstado: s.IdEstado, idDistritoLocal: s.IdDistritoLocal, name: s.Seccion.ToString());
                return null;
            }
        }

        public static TerritorioModel GetSeccionByName(int idEncarte, int idEstado, string name)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var nSeccion = 0;
                int.TryParse(name, out nSeccion);
                var s = ctx.CATSecciones.FirstOrDefault(p => p.IdEncarte == idEncarte && p.IdEstado == idEstado && p.Seccion == nSeccion);
                if (s != null)
                {
                    return new TerritorioModel(idEstado: idEstado, idMunicipio: s.IdMunicipio, idDistritoFederal: s.IdDistritoFederal, idDistritoLocal: s.IdDistritoLocal, idSeccion: s.IdSeccion, name: s.Seccion.ToString());
                }

                if (s == null)
                {
                    var d = ctx.DATCambioSeccion.FirstOrDefault(dc => dc.IdEncarte == idEncarte && dc.IdEstado == idEstado && dc.SeccionVieja == nSeccion);
                    if (d != null)
                    {
                        return new TerritorioModel(idEstado: idEstado, idMunicipio: d.CATSecciones.IdMunicipio, idDistritoFederal: d.CATSecciones.IdDistritoFederal, idDistritoLocal: d.CATSecciones.IdDistritoLocal, idSeccion: d.IdSeccionNueva, name: d.CATSecciones.Seccion.ToString());
                    }
                }

                return null;
            }
        }

        public static bool SaveTerritorio(Territorio terr)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                ctx.Territorio.Add(terr);
                ctx.SaveChanges();
                return true;
            }
        }

        public static bool SaveTerritorios(Guid idProceso, string userName, int[] territorios, int tipoTerritorio)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                foreach (var item in territorios)
                {
                    var territorio = new Territorio
                    {
                        IdProceso = idProceso,
                        UserName = userName,
                    };
                    switch ((TipoTerritorio)tipoTerritorio)
                    {
                        case TipoTerritorio.Estado:
                            territorio.IdEstado = item;
                            break;
                    }
                    ctx.Territorio.Add(territorio);
                }
                ctx.SaveChanges();
                return true;
            }
        }

        public static bool SaveTerritorios(Guid idProceso, string userName, Territorio[] territorios)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                foreach (var item in territorios)
                {
                    var territorio = new Territorio
                    {
                        IdProceso = idProceso,
                        UserName = userName,
                        IdEstado = item.IdEstado,
                        IdDistritoFederal = item.IdDistritoFederal,
                        IdMunicipio = item.IdMunicipio
                    };
                    ctx.Territorio.Add(territorio);
                }
                ctx.SaveChanges();
                return true;
            }
        }

        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> IsEstado()
        {
            return p => !p.IdMunicipio.HasValue && !p.IdDistritoFederal.HasValue && !p.IdDistritoLocal.HasValue && !p.IdSeccion.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> HasEstado()
        {
            return p => p.IdEstado.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> IsDistritoFederal()
        {
            return p => !p.IdMunicipio.HasValue && p.IdDistritoFederal.HasValue && !p.IdDistritoLocal.HasValue && !p.IdSeccion.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> HasDistritoFederal()
        {
            return p => p.IdDistritoFederal.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> IsMunicipio()
        {
            return p => p.IdMunicipio.HasValue && !p.IdSeccion.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> HasMunicipio()
        {
            return p => p.IdMunicipio.HasValue;
        }
        public static System.Linq.Expressions.Expression<Func<Territorio, bool>> IsSeccion()
        {
            return p => p.IdSeccion.HasValue;
        }
    }
}
