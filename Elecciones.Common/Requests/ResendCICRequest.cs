using Elecciones.Common.Enums;
using System;

namespace Elecciones.Common.Requests
{
    public class ResendCICRequest
    {
        public Guid IdPerson { get; set; }
        public string CIC { get; set; }
        public string OCR { get; set; }
        public string ClaveElector { get; set; }
        public string NoEmision { get; set; }
        public TypeCredential TypeCredential { get; set; }
    }
}
