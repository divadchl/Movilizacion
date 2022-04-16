using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Criteria
{
    public class VCriteria
    {
        public string PropertyName { get; set; }
        public string Comparer { get; set; }
        public dynamic Value { get; set; }
    }
}
