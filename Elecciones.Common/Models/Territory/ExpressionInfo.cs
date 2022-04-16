using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public class ExpressionInfo<T>
    {
        public ExpressionClass Clase { get; set; }

        public ExpressionInfo()
        {
            var tipo = typeof(T);
            var propiedades = tipo.GetProperties().Select(s => new ExpressionProperty { Nombre = s.Name, Tipo = s.PropertyType }).ToList();

            Clase = new ExpressionClass { Tipo = tipo, Propiedades = propiedades };
        }

        public ExpressionInfo(T obj)
        {
            var tipo = typeof(T);
            var propiedades = obj.GetType().GetProperties().Select(s => new ExpressionProperty { Nombre = s.Name, Tipo = s.PropertyType, Valor = s.GetValue(obj) }).ToList();

            Clase = new ExpressionClass { Tipo = tipo, Propiedades = propiedades };
        }
    }
}
