using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Elecciones.Common.Models.Territory;
using Elecciones.Models.DBSMovilizacion;

namespace Elecciones.Models.Models.Territory
{
    public class KeyTerritorio
    {
        public int IdTerritorio { get; set; }
        public TerritorioDataManager Territorio { get; set; }

        public KeyTerritorio()
        {

        }

        public KeyTerritorio(Territorio territorio)
        {
            IdTerritorio = territorio.IdTerritorio;
            Territorio = new TerritorioDataManager(
                new List<ITerritorio> {
                    territorio.CATEstado != null ? new VEstado(territorio.CATEstado) : null,
                    territorio.CATMunicipios != null ? new VMunicipio(territorio.CATMunicipios) : null,
                    territorio.CATDistritoFederal != null ? new VDistritoFederal(territorio.CATDistritoFederal) : null,
                    territorio.CATDistritoLocal != null ? new VDistritoLocal(territorio.CATDistritoLocal) : null,
                    territorio.CATSecciones != null ? new VSeccion(territorio.CATSecciones) : null });


            //var iterritorio = new List<ITerritorio>();
            //iterritorio.Add(new VEstado(territorio.CATEstado));

            //if (Territorio.Municipios == null)
            //{
            //    using (var context = new DBDeteccionEntities())
            //    {
            //        var municipios = context.CATMunicipios.Where(m => m.IdEstado == territorio.CATEstado.IdEstado);
            //        var secciones = context.CATSecciones.Where(s => s.IdEstado == territorio.CATEstado.IdEstado);
            //        if (territorio.CATDistritoFederal != null)
            //        {
            //            secciones = context.CATSecciones.Where(m => m.IdEstado == territorio.CATEstado.IdEstado && m.IdDistritoFederal == territorio.CATDistritoFederal.IdDistritoFederal);
            //        }
            //        if (territorio.CATDistritoLocal != null)
            //        {
            //            secciones = context.CATSecciones.Where(m => m.IdEstado == territorio.CATEstado.IdEstado && m.IdDistritoLocal == territorio.CATDistritoLocal.IdDistritoLocal);
            //        }
            //        var municipios = secciones.Select(s => s.CATMunicipios);
            //        iterritorio.Add(new VMunicipio(municipios));

            //    }
            //}


        }
    }
}
