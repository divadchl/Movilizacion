using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Elecciones.Common.Models.Territory
{
    public class ExpressionBuilder<T>
    {
        private ParameterExpression Param { get; set; }

        public ExpressionRequest<T> Request { get; set; }

        public ExpressionBuilder()
        {
            Param = Expression.Parameter(typeof(T), "s");
            Request = new ExpressionRequest<T>();
        }

        public Expression<Func<T, bool>> TransformExpression()
        {
            var genericExpression = CreateSimpleExpression();

            var lambda = Expression.Lambda<Func<T, bool>>(genericExpression, Param);
            return lambda;
        }

        private Expression CreateSimpleExpression()
        {
            var lambdas = Request.ClassToMap.Propiedades.Aggregate<ExpressionProperty, Expression>(null, (current, propiedad) => current != null ? Expression.AndAlso(current, GenerateExpression(propiedad)) : GenerateExpression(propiedad));
            return lambdas;
        }


        private Expression GenerateExpression(ExpressionProperty propiedad)
        {
            if (!String.IsNullOrEmpty(propiedad.Metodo) && propiedad.Metodo.ToLower() != "equals")
                return GenerateCustomExpression(propiedad);

            var property = Expression.Property(Param, typeof(T).GetProperty(propiedad.Nombre));
            var constant = GetConstantExpression(propiedad);
            Expression equa = Expression.Equal(property, constant);
            return equa;
        }

        private Expression GenerateCustomExpression(ExpressionProperty propiedad)
        {
            if (propiedad.Metodo.ToLower() != "contains") return null;

            var property = Expression.Property(Param, typeof(T).GetProperty(propiedad.Nombre));
            var t = propiedad.Valor.GetType();
            var valor = Convert.ChangeType(propiedad.Valor, t);
            var tipoProp = property.Type;

            if (tipoProp == typeof(string))
            {
                var constant = GetConstantExpression(propiedad);
                var propiedadTipo = propiedad.Tipo;
                var method = propiedadTipo.GetMethod(propiedad.Metodo, new[] { propiedadTipo });
                Expression custom = Expression.Call(property, method, constant);
                return custom;
            }

            if (!IsNullable(tipoProp))
            {
                var method = t.GetMethod(propiedad.Metodo, new[] { property.Type });
                var target = Expression.Constant(valor);
                var custom = Expression.Call(target, method, property);
                return custom;
            }
            else
            {
                var valores = new List<int?>();
                for (var i = 0; i < valor.Count; i++)
                    valores.Add(valor[i]);

                var method = valores.GetType().GetMethod(propiedad.Metodo, new[] { property.Type });
                var target = Expression.Constant(valores);
                var custom = Expression.Call(target, method, property);
                return custom;
            }
        }

        private static Expression GetConstantExpression(ExpressionProperty tipo)
        {
            var t = Nullable.GetUnderlyingType(tipo.Tipo) ?? tipo.Tipo;
            var valor = Convert.ChangeType(tipo.Valor, t);
            Expression constant = Expression.Constant(valor, tipo.Tipo);

            return constant;
        }

        private static bool IsNullable(Type type)
        {
            return Nullable.GetUnderlyingType(type) != null;
        }
    }
}
