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
    
    public partial class CATTipoContacto
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public CATTipoContacto()
        {
            this.DATContacto = new HashSet<DATContacto>();
        }
    
        public int IdTipoContacto { get; set; }
        public string TipoContacto { get; set; }
        public string Color { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DATContacto> DATContacto { get; set; }
    }
}
