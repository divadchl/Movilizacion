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
    
    public partial class DATCambioSeccion
    {
        public int IdCambio { get; set; }
        public int IdSeccionNueva { get; set; }
        public int SeccionVieja { get; set; }
        public int IdEstado { get; set; }
        public int IdEncarte { get; set; }
        public System.DateTime AddDate { get; set; }
        public string AddUser { get; set; }
    
        public virtual CATEstado CATEstado { get; set; }
        public virtual CATSecciones CATSecciones { get; set; }
        public virtual Encarte Encarte { get; set; }
    }
}
