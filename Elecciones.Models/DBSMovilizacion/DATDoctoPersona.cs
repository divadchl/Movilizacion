//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Elecciones.Models.DBSMovilizacion
{
    using System;
    using System.Collections.Generic;
    
    public partial class DATDoctoPersona
    {
        public System.Guid IdDoctoPersona { get; set; }
        public System.Guid IdPersona { get; set; }
        public int IdTipoDocumento { get; set; }
        public byte[] Documento { get; set; }
        public System.DateTime FechaRegistro { get; set; }
        public string Nombre { get; set; }
    
        public virtual CATTipoDocumento CATTipoDocumento { get; set; }
        public virtual DATPersonas DATPersonas { get; set; }
    }
}
