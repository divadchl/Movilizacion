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
    
    public partial class DATContacto
    {
        public System.Guid IdContacto { get; set; }
        public System.Guid IdProceso { get; set; }
        public System.Guid IdPersona { get; set; }
        public bool Voto { get; set; }
        public int IdTipoContacto { get; set; }
        public string Usuario { get; set; }
        public Nullable<System.DateTime> FechaHora { get; set; }
    
        public virtual CATTipoContacto CATTipoContacto { get; set; }
        public virtual DATPersonas DATPersonas { get; set; }
        public virtual DATProceso DATProceso { get; set; }
    }
}
