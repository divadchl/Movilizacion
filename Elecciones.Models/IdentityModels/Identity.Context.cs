//------------------------------------------------------------------------------
// <auto-generated>
//     Este código se generó a partir de una plantilla.
//
//     Los cambios manuales en este archivo pueden causar un comportamiento inesperado de la aplicación.
//     Los cambios manuales en este archivo se sobrescribirán si se regenera el código.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Elecciones.Models.IdentityModels
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class DBSMovilizacionIdentityEntities : DbContext
    {
        public DBSMovilizacionIdentityEntities()
            : base("name=DBSMovilizacionIdentityEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<ApplicationUserGroups> ApplicationUserGroups { get; set; }
        public virtual DbSet<AspNetUsers> AspNetUsers { get; set; }
        public virtual DbSet<ApplicationGroupRoles> ApplicationGroupRoles { get; set; }
        public virtual DbSet<ApplicationGroups> ApplicationGroups { get; set; }
        public virtual DbSet<AspNetRoles> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaims> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogins> AspNetUserLogins { get; set; }
    }
}
