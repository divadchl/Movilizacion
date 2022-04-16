using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Elecciones.Logic.Territory
{
    public class TerritorioFilter
    {
        private string _userName;
        private ProcesoModel _proceso;
        private List<TerritorioModel> _territories;
        private List<int> _estados;
        private List<int> _municipios;
        private List<int> _distritosFederales;
        private List<int> _distritosLocales;
        private List<int> _secciones;

        public TerritorioFilter(string userName, ProcesoModel proceso)
        {
            this._userName = userName;
            this._proceso = proceso;
        }

        public List<int> Estados
        {
            get
            {
                if (_estados == null)
                {
                    _estados = new List<int>();
                    Territorios.ForEach(p => _estados.Add(p.GetEstados().Id));
                }
                return _estados;
            }
        }
        public List<int> Municipios
        {
            get
            {
                if (_municipios == null)
                {
                    _municipios = new List<int>();
                    Territorios.ForEach(p => _municipios.AddRange(p.GetMunicipios(_proceso.IdEncarte).Select(q => q.Id)));
                }
                return _municipios;
            }
        }
        public List<int> DistritosFederales
        {
            get
            {
                if (_distritosFederales == null)
                {
                    _distritosFederales = new List<int>();
                    Territorios.ForEach(p => _distritosFederales.AddRange(p.GetDistritosFederales(_proceso.IdEncarte).Select(q => q.Id)));
                }
                return _distritosFederales;
            }
        }
        public List<int> DistritosLocales
        {
            get
            {
                if (_distritosLocales == null)
                {
                    _distritosLocales = new List<int>();
                    Territorios.ForEach(p => _distritosLocales.AddRange(p.GetDistritosLocales(_proceso.IdEncarte).Select(q => q.Id)));
                }
                return _distritosLocales;
            }
        }
        public List<int> Secciones
        {
            get
            {
                if (_secciones == null)
                {
                    _secciones = new List<int>();
                    Territorios.ForEach(p => _secciones.AddRange(p.GetSecciones(_proceso.IdEncarte).Select(q => q.Id)));
                }
                return _secciones;
            }
        }
        private List<TerritorioModel> Territorios
        {
            get
            {
                if (_territories == null)
                {
                    using (var ctx = new DBDeteccionEntities())
                    {
                        _territories = ctx.Territorio.Where(p => p.UserName == _userName && p.IdProceso == _proceso.Id)
                                        .AsEnumerable()
                                       .Select(p => new TerritorioModel(p)).ToList();
                    }
                }
                return _territories;
            }
        }
    }
}
