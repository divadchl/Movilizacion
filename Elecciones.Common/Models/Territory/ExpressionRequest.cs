using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public class ExpressionRequest<T>
    {
        private ExpressionInfo<T> CurrentClass { get; set; }

        public ExpressionClass ClassToMap { get; set; }

        public ExpressionRequest()
        {
            CurrentClass = new ExpressionInfo<T>();
            ClassToMap = new ExpressionClass();
        }

        public void AddProperty(dynamic value, string propertyName, int territory = 0, string method = "")
        {
            var propiedad = CurrentClass.Clase.Propiedades.FirstOrDefault(s => s.Nombre == propertyName);
            if (propiedad == null) return;
            propiedad.Valor = value;
            propiedad.Metodo = method;
            propiedad.Territory = territory;
            ClassToMap.Propiedades.Add(propiedad);
        }
    }
}
