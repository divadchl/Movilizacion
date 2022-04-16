using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public static class ETerritorioOrder
    {
        public enum TerritorioOrder { Estado = 1, Municipio = 2, DistritoFederal = 3, DistritoLocal = 4, Seccion = 5, None = 0 };

        public static TerritorioOrder GetId(ITerritorio territorio)
        {
            var tipoTerritorio = territorio.GetType();

            if (typeof(VEstado) == tipoTerritorio)
                return TerritorioOrder.Estado;
            if (typeof(VMunicipio) == tipoTerritorio)
                return TerritorioOrder.Municipio;
            if (typeof(VDistritoFederal) == tipoTerritorio)
                return TerritorioOrder.DistritoFederal;
            if (typeof(VDistritoLocal) == tipoTerritorio)
                return TerritorioOrder.DistritoLocal;
            if (typeof(VSeccion) == tipoTerritorio)
                return TerritorioOrder.Seccion;

            return TerritorioOrder.None;
        }

        public static string GetProperty(TerritorioOrder territorio)
        {
            var result = string.Empty;
            switch (territorio)
            {
                case TerritorioOrder.Estado:
                    result = "IdEstado";
                    break;
                case TerritorioOrder.Municipio:
                    result = "IdMunicipio";
                    break;
                case TerritorioOrder.DistritoFederal:
                    result = "IdDistritoFederal";
                    break;
                case TerritorioOrder.DistritoLocal:
                    result = "IdDistritoLocal";
                    break;
                case TerritorioOrder.Seccion:
                    result = "IdSeccion";
                    break;
            }
            return result;
        }
    }
}
