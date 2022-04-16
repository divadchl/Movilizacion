using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VMunicipio : ITerritorio, IDisposable
    {
        protected DBDeteccionEntities MimoContext { get; set; }
        protected CATMunicipios Municipio { get; set; }

        public VMunicipio()
        {

        }

        public VMunicipio(int id)
        {
            Id = id;
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATMunicipios.FirstOrDefault(s => s.IdMunicipio == Id);
            if (temp == null) throw new Exception("Municipio no existe");
            Municipio = temp;
            EntityMapper();
        }


        public VMunicipio(int edo, int nMunicipio)
        {
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATMunicipios.FirstOrDefault(s => s.IdEstado == edo && s.IdMunicipio == nMunicipio);
            if (temp == null) throw new Exception("Municipio no existe");
            Municipio = temp;
            EntityMapper();
        }

        public VMunicipio(CATMunicipios mpio)
        {
            Municipio = mpio;
            EntityMapper();
        }

        //public VMunicipio(int idMunicipio, string municipio)
        //{
        //    Id = idMunicipio;
        //    Descripcion = municipio;
        //    Firma = String.Format(" > M: {0}", Descripcion.ToUpper());
        //}

        public void EntityMapper()
        {
            Id = Municipio.IdMunicipio;
            Descripcion = Municipio.descripcion;
            //Firma = String.Format(" > M: {0}", Municipio.municipio.ToUpper());
            Value = Municipio.municipio.ToString();
        }

        public int Id { get; private set; }

        public string Descripcion { get; private set; }

        public string Firma { get; private set; }
        public string Value { get; set; }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposing) return;
            if (MimoContext != null)
            {
                MimoContext.Dispose();
            }
        }

        public override int GetHashCode()
        {
            return Id;
        }

        public override bool Equals(object obj)
        {
            return Id == ((VMunicipio)obj).Id;
        }
    }
}
