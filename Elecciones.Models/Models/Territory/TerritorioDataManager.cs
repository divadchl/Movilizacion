using Elecciones.Common.Models.Territory;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Models.Models.Territory
{
    public class TerritorioDataManager : IDisposable
    {
        public Dictionary<ETerritorioOrder.TerritorioOrder, ITerritorio> Territorios { get; set; }

        private readonly ExpressionBuilder<CATSecciones> _expSeccion;

        protected DBDeteccionEntities MimoContext { get; set; }

        private IEnumerable<CATMunicipios> _municipios;
        private IEnumerable<CATDistritoFederal> _distritoFederal;
        private IEnumerable<CATDistritoLocal> _distritoLocal;
        private IEnumerable<CATSecciones> _seccion;

        //public string Firma
        //{
        //    get
        //    {
        //        object[] territorio = new String[5];
        //        var territorios = Territorios.OrderBy(s => s.Key).Select(s => s.Value.Firma).ToArray();
        //        for (var i = 0; i < territorios.Count(); i++)
        //        {
        //            territorio[i] = territorios[i];
        //        }
        //        return String.Format("{0}{1}{2}{3}{4}", territorio);
        //    }
        //}

        public TerritorioDataManager()
        {
            MimoContext = new DBDeteccionEntities();
            _expSeccion = new ExpressionBuilder<CATSecciones>();
            Territorios = new Dictionary<ETerritorioOrder.TerritorioOrder, ITerritorio>();
        }

        public TerritorioDataManager(IEnumerable<ITerritorio> territorios, bool updateExpression = true)
        {
            MimoContext = new DBDeteccionEntities();
            _expSeccion = new ExpressionBuilder<CATSecciones>();
            Territorios = new Dictionary<ETerritorioOrder.TerritorioOrder, ITerritorio>();

            var ters = territorios.Where(s => s != null).Select(s => new { ter = s, idTer = ETerritorioOrder.GetId(s) }).Where(
                s => s.idTer != ETerritorioOrder.TerritorioOrder.None).ToList();

            ters.ForEach(s => Territorios.Add(s.idTer, s.ter));

            if (updateExpression) UpdateExpression();
        }

        public void Add(ITerritorio territorio)
        {
            if (territorio == null) return;
            var idTerritorio = ETerritorioOrder.GetId(territorio);
            if (idTerritorio == ETerritorioOrder.TerritorioOrder.None) return;
            Territorios.Add(idTerritorio, territorio);
            UpdateExpression();
        }

        private void UpdateExpression()
        {
            _expSeccion.Request.ClassToMap = new ExpressionClass();
            Territorios.Select(s => new { s.Key, s.Value }).ToList().ForEach(
                s => _expSeccion.Request.AddProperty(s.Value.Id, ETerritorioOrder.GetProperty(s.Key)));
            var expression = _expSeccion.TransformExpression();

            var secciones = MimoContext.CATSecciones.Where(expression);
            _municipios = secciones.Select(s => s.CATMunicipios).Distinct();
            _distritoFederal = secciones.Select(s => s.CATDistritoFederal).Distinct();
            _distritoLocal = secciones.Select(s => s.CATDistritoLocal).Distinct();
            _seccion = secciones;
        }

        public IEnumerable<ITerritorio> Estados
        {
            get
            {
                if (Territorios.Any(s => s.Key == ETerritorioOrder.TerritorioOrder.Estado))
                {
                    return Territorios.Where(s => s.Key == ETerritorioOrder.TerritorioOrder.Estado).Select(s => s.Value);
                }
                using (var context = new DBDeteccionEntities())
                {
                    return context.CATEstado.Select(s => new VEstado(s)).ToList();
                }
            }
        }

        public IEnumerable<TerritorioDataManager> Secciones
        {
            get
            {
                return
                    _seccion.Select(
                        s =>
                        new TerritorioDataManager(new List<ITerritorio>
                                                  {
                                                      s.CATEstado != null  ? new VEstado(s.CATEstado) : null,
                                                      s.CATMunicipios != null  ? new VMunicipio(s.CATMunicipios) : null,
                                                      s.CATDistritoFederal != null  ? new VDistritoFederal(s.CATDistritoFederal) : null,
                                                      s.CATDistritoLocal != null  ? new VDistritoLocal(s.CATDistritoLocal) : null,
                                                      new VSeccion(s)
                                                  }));
            }
        }

        public IEnumerable<ITerritorio> Municipios { get { return _municipios.Select(s => new VMunicipio(s)); } }

        public IEnumerable<ITerritorio> DistritoFederal { get { return _distritoFederal.Select(s => new VDistritoFederal(s)); } }

        public IEnumerable<ITerritorio> DistritoLocal { get { return _distritoLocal.Where(s => s != null).Select(s => new VDistritoLocal(s)); } }

        //public int Casillas { get { return _seccion.Select(c => c.CatCasilla).Count(); } }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (MimoContext != null)
                {
                    MimoContext.Dispose();
                }
            }
        }
    }
}
