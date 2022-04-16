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
    
    public partial class DATPreguntas
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public DATPreguntas()
        {
            this.DATRespuestas = new HashSet<DATRespuestas>();
            this.DATRespUsuario = new HashSet<DATRespUsuario>();
        }
    
        public System.Guid IdPregunta { get; set; }
        public string Pregunta { get; set; }
        public System.Guid IdEncuesta { get; set; }
        public int IdTipoPregunta { get; set; }
        public Nullable<bool> Activo { get; set; }
        public string InsertedUser { get; set; }
        public Nullable<System.DateTime> InsertedDate { get; set; }
        public string ModifiedUser { get; set; }
        public Nullable<System.DateTime> ModifiedDate { get; set; }
        public Nullable<System.Guid> IdProceso { get; set; }
    
        public virtual CATTipoPregunta CATTipoPregunta { get; set; }
        public virtual DATEncuestas DATEncuestas { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DATRespuestas> DATRespuestas { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DATRespUsuario> DATRespUsuario { get; set; }
    }
}