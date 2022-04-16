using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Elecciones.Logic
{
    public class TerritorioModel
    {
        public int IdTerritorio { get; }
        public int Id { get { return _id; } }
        [Display(Name = "Tipo")]
        public TipoTerritorio Type { get { return _type; } }
        [Display(Name = "Nombre")]
        public string Name
        {
            get
            {
                switch (_type)
                {
                    case TipoTerritorio.Estado:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetEstado(IdEstado).Name : _name;
                    case TipoTerritorio.Municipio:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetMunicipio(IdMunicipio.Value).Name : _name;
                    case TipoTerritorio.DistritoFederal:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetDistritoFederal(IdDistritoFederal.Value).Name : _name;
                    case TipoTerritorio.DistritoLocal:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetDistritoLocal(IdDistritoLocal.Value).Name : _name;
                    case TipoTerritorio.DistritoFederal_Municipio:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetMunicipio(IdMunicipio.Value).Name : _name;
                    case TipoTerritorio.Seccion:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetSeccion(IdSeccion.Value).Name : _name;
                    case TipoTerritorio.DistritoFederal_DistritoLocal:
                        return string.IsNullOrEmpty(_name) ? TerritorioManager.GetDistritoLocal(IdDistritoLocal.Value).Name : _name;
                }
                return string.Empty;
            }
        }
        [Display(Name = "Territorio")]
        public string FullName
        {
            get
            {
                var st = TerritorioManager.GetEstado(IdEstado);
                TerritorioModel df, dl, mun, sec;
                switch (_type)
                {
                    case TipoTerritorio.Estado:
                        return string.Format("E:{0}", st.ShortName);
                    case TipoTerritorio.Municipio:
                        mun = TerritorioManager.GetMunicipio(IdMunicipio.Value);
                        return string.Format("E:{0} > M:{1}", st.ShortName, mun.Name);
                    case TipoTerritorio.DistritoFederal:
                        df = TerritorioManager.GetDistritoFederal(IdDistritoFederal.Value);
                        return string.Format("E:{0} > DF:{1}", st.ShortName, df.Name);
                    case TipoTerritorio.DistritoLocal:
                        dl = TerritorioManager.GetDistritoLocal(IdDistritoLocal.Value);
                        return string.Format("E:{0} > DL:{1}", st.ShortName, dl.Name);
                    case TipoTerritorio.DistritoFederal_Municipio:
                        df = TerritorioManager.GetDistritoFederal(IdDistritoFederal.Value);
                        mun = TerritorioManager.GetMunicipio(IdMunicipio.Value);
                        return string.Format("E:{0} > DF:{1} > M:{2}", st.ShortName, df.Name, mun.Name);
                    case TipoTerritorio.Seccion:
                        sec = TerritorioManager.GetSeccion(IdSeccion.Value);
                        return string.Format("E:{0} > S:{1}", st.ShortName, sec.Name);
                    case TipoTerritorio.DistritoFederal_DistritoLocal:
                        dl = TerritorioManager.GetDistritoLocal(IdDistritoLocal.Value);
                        df = TerritorioManager.GetDistritoFederal(IdDistritoFederal.Value);
                        return string.Format("E:{0} > DF:{1} > DL:{2}", st.ShortName, df.Name, dl.Name);
                }
                return string.Empty;
            }
        }
        public string ShortName
        {
            get
            {
                switch (_type)
                {
                    case TipoTerritorio.Estado:
                        return string.IsNullOrEmpty(_shortName) ? TerritorioManager.GetEstado(IdEstado).Name : _shortName;
                    case TipoTerritorio.Municipio:
                        var shortName = string.Empty;
                        var words = Name.Replace(".", "").Replace(",", "").Split(' ');
                        if (words.Length > 1)
                            foreach (var w in words)
                                shortName += w.Substring(0, w.Length >= 3 ? 3 : w.Length);
                        else
                            shortName = Name;
                        return shortName;
                    case TipoTerritorio.DistritoLocal:
                        return string.IsNullOrEmpty(_shortName) ? string.Format("DL{0}", Name) : _shortName;
                    case TipoTerritorio.DistritoFederal:
                        return string.IsNullOrEmpty(_shortName) ? string.Format("DF{0}", Name) : _shortName;
                    case TipoTerritorio.Seccion:
                        return string.IsNullOrEmpty(_shortName) ? string.Format("S{0}", Name) : _shortName;
                }
                return string.Empty;
            }
        }

        private int _id;
        private TipoTerritorio _type;
        private string _name;
        private string _shortName;

        public int IdEstado { get; }
        public int? IdMunicipio { get; }
        public int? IdDistritoLocal { get; }
        public int? IdDistritoFederal { get; }
        public int? IdSeccion { get; set; }


        public TerritorioModel(Territorio territorio)
        {
            IdTerritorio = territorio.IdTerritorio;
            IdEstado = territorio.IdEstado.Value;
            IdMunicipio = territorio.IdMunicipio;
            IdDistritoLocal = territorio.IdDistritoLocal;
            IdDistritoFederal = territorio.IdDistritoFederal;
            IdSeccion = territorio.IdSeccion;

            SetTerritorio();
        }

        public TerritorioModel(int idEstado, int? idMunicipio = null, int? idDistritoLocal = null, int? idDistritoFederal = null, int? idSeccion = null, string name = null, string shortName = null)
        {
            IdEstado = idEstado;
            IdMunicipio = idMunicipio;
            IdDistritoLocal = idDistritoLocal;
            IdDistritoFederal = idDistritoFederal;
            IdSeccion = idSeccion;
            _name = name;
            _shortName = shortName;

            SetTerritorio();
        }

        private void SetTerritorio()
        {
            if (IdSeccion.HasValue)
            {
                _type = TipoTerritorio.Seccion;
                _id = IdSeccion.Value;
            }
            if (IdMunicipio.HasValue && !IdDistritoLocal.HasValue && !IdDistritoFederal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.Municipio;
                _id = IdMunicipio.Value;
            }
            if (IdDistritoLocal.HasValue && !IdMunicipio.HasValue && !IdDistritoFederal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.DistritoLocal;
                _id = IdDistritoLocal.Value;
            }
            if (IdDistritoFederal.HasValue && !IdMunicipio.HasValue && !IdDistritoLocal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.DistritoFederal;
                _id = IdDistritoFederal.Value;
            }
            if (IdDistritoFederal.HasValue && IdMunicipio.HasValue && !IdDistritoLocal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.DistritoFederal_Municipio;
                _id = IdMunicipio.Value;
            }
            if (IdDistritoFederal.HasValue && !IdMunicipio.HasValue && IdDistritoLocal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.DistritoFederal_DistritoLocal;
                _id = IdDistritoLocal.Value;
            }
            if (!IdMunicipio.HasValue && !IdDistritoLocal.HasValue && !IdDistritoFederal.HasValue && !IdSeccion.HasValue)
            {
                _type = TipoTerritorio.Estado;
                _id = IdEstado;
            }
        }

        public List<TerritorioModel> GetSecciones(int idEncarte)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var secciones = GetSeccionesDb(idEncarte, ctx);

                return secciones.AsEnumerable()
                            .Select(p => new TerritorioModel(
                                idEstado: IdEstado,
                                idDistritoFederal: p.IdDistritoFederal,
                                idDistritoLocal: p.IdDistritoLocal,
                                idMunicipio: p.IdMunicipio,
                                idSeccion: p.IdSeccion,
                                name: p.Seccion.ToString())
                            ).ToList();
            }
        }

        public TerritorioModel GetEstados()
        {
            return (new TerritorioModel(idEstado: IdEstado, name: Name, shortName: ShortName));
        }

        public List<TerritorioModel> GetDistritosFederales(int idEncarte)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var result = new List<TerritorioModel>();

                var secciones = GetSeccionesDb(idEncarte, ctx);

                return secciones.GroupBy(p => p.IdDistritoFederal)
                                    .AsEnumerable()
                                    .Select(p => new TerritorioModel(idEstado: IdEstado,
                                                                    idDistritoFederal: p.Key)).ToList();
            }
        }

        public List<TerritorioModel> GetDistritosLocales(int idEncarte)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var result = new List<TerritorioModel>();

                var secciones = GetSeccionesDb(idEncarte, ctx);

                return secciones.GroupBy(p => p.IdDistritoLocal)
                                    .AsEnumerable()
                                    .Select(p => new TerritorioModel(idEstado: IdEstado,
                                                                    idDistritoLocal: p.Key)).ToList();
            }
        }

        public List<TerritorioModel> GetMunicipios(int idEncarte)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var result = new List<TerritorioModel>();

                var secciones = GetSeccionesDb(idEncarte, ctx);

                return secciones.GroupBy(p => p.IdMunicipio)
                                    .AsEnumerable()
                                    .Select(p => new TerritorioModel(idEstado: IdEstado,
                                                                    idMunicipio: p.Key)).ToList();
            }
        }

        private IQueryable<CATSecciones> GetSeccionesDb(int idEncarte, DBDeteccionEntities ctx)
        {
            var secciones = ctx.CATSecciones.Where(p => p.IdEstado == IdEstado && p.IdEncarte == idEncarte).AsQueryable();
            if (IdMunicipio.HasValue)
                secciones = secciones.Where(p => p.IdMunicipio == IdMunicipio.Value);
            if (IdDistritoLocal.HasValue)
                secciones = secciones.Where(p => p.IdDistritoLocal == IdDistritoLocal.Value);
            if (IdDistritoFederal.HasValue)
                secciones = secciones.Where(p => p.IdDistritoFederal == IdDistritoFederal.Value);
            if (IdSeccion.HasValue)
                secciones = secciones.Where(p => p.IdSeccion == IdSeccion.Value);
            return secciones;
        }

    }
    public enum TipoTerritorio
    {
        Estado = 1,
        Municipio = 2,
        DistritoFederal = 3,
        DistritoLocal = 4,
        Seccion = 5,
        DistritoFederal_Municipio = 6,
        DistritoFederal_DistritoLocal = 7,
    }
}
