using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VDummy : ITerritorio
    {
        public VDummy()
        {

        }

        public VDummy(ITerritorio ter)
        {
            Id = ter.Id;
            Descripcion = ter.Descripcion;
            TipoTerritorio = ETerritorioOrder.GetId(ter);
            Firma = ter.Firma;
            Value = ter.Value;
        }

        public VDummy(int id, int tipoTerritorio)
        {
            Id = id;
            TipoTerritorio = (ETerritorioOrder.TerritorioOrder)tipoTerritorio;
        }

        public ETerritorioOrder.TerritorioOrder TipoTerritorio { get; set; }

        public int Id { get; set; }

        public string Descripcion { get; set; }

        public string Firma { get; set; }

        public List<VDummy> Lista { get; set; }

        public string Value { get; set; }

        public ITerritorio GetEntity()
        {
            switch (TipoTerritorio)
            {
                case ETerritorioOrder.TerritorioOrder.Estado:
                    return new VEstado(Id);
                case ETerritorioOrder.TerritorioOrder.Municipio:
                    return new VMunicipio(Id);
                case ETerritorioOrder.TerritorioOrder.DistritoFederal:
                    return new VDistritoFederal(Id);
                case ETerritorioOrder.TerritorioOrder.DistritoLocal:
                    return new VDistritoLocal(Id);
                case ETerritorioOrder.TerritorioOrder.Seccion:
                    return new VSeccion(Id);
                default:
                    return null;
            }
        }
    }

    public class VMessage
    {
        public string Message { get; set; }
        public bool Error { get; set; }
    }
}
