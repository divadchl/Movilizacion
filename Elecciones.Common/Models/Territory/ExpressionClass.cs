using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public class ExpressionClass
    {
        public string Nombre { get; set; }

        public Type Tipo { get; set; }

        public string TipoDescripcion
        {
            get { return Tipo.FullName; }
        }

        public List<ExpressionProperty> Propiedades { get; set; }

        public ExpressionClass()
        {
            Propiedades = new List<ExpressionProperty>();
        }
    }
}
