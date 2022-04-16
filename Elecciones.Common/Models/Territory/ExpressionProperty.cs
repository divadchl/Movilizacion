using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public class ExpressionProperty
    {
        public string Nombre { get; set; }

        public string Metodo { get; set; }

        public Type Tipo { get; set; }

        public dynamic Valor { get; set; }

        public string TipoDescripcion
        {
            get { return Tipo.FullName; }
        }

        public int Territory { get; set; }
    }
}
