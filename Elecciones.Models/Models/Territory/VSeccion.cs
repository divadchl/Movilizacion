using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VSeccion : ITerritorio, IDisposable
    {
        protected DBDeteccionEntities MimoContext { get; set; }
        protected CATSecciones Seccion { get; set; }

        public VSeccion()
        {

        }

        public VSeccion(int id, bool load = true)
        {
            Id = id;
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATSecciones.FirstOrDefault(s => s.IdSeccion == id);
            if (temp == null) throw new Exception("Seccion no existe");
            Seccion = temp;
            EntityMapper();
        }

        //public VSeccion(int edo, int seccion)
        //{
        //    MimoContext = new DBSMimoEntities();
        //    var temp = MimoContext.CatSecciones.FirstOrDefault(s => s.IdEstado == edo && s.Seccion == seccion);
        //    if (temp == null) throw new Exception("Seccion no existe");
        //    Seccion = temp;
        //    EntityMapper();
        //}

        //public VSeccion(int idSeccion , int seccion)
        //{
        //    Id = idSeccion;
        //    Descripcion = seccion.ToString();
        //    Firma = String.Format(" > S: {0:D4}", seccion);
        //}

        public VSeccion(CATSecciones sec)
        {
            Seccion = sec;
            EntityMapper();
        }

        public void EntityMapper()
        {
            Id = Seccion.IdSeccion;
            Descripcion = Seccion.Seccion.ToString();
            //Firma = String.Format(" > S: {0:D4}", Seccion.Seccion);
            Value = Seccion.Seccion.ToString();
        }

        public int Id { get; private set; }

        public string Descripcion { get; private set; }

        public string Firma { get; private set; }
        public string Value { get; private set; }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposing) return;
            if (MimoContext == null) return;
            MimoContext.Dispose();
        }
    }
}
