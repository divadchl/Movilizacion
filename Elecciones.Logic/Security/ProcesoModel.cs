using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elecciones.Logic.Security
{
    public class ProcesoModel
    {
        public Guid Id { get; set; }
        [Display(Name = "Nombre")]
        public string Name { get; set; }
        [Display(Name = "Fecha")]
        public DateTime Date { get; set; }
        public int IdEncarte { get; set; }
        public string Encarte { get; set; }
        [Display(Name = "Territorios")]
        public List<TerritorioModel> Territories
        {
            get
            {
                _territories = _territories ?? ProcesoManager.GetTerritorios(Id);
                return _territories;
            }
        }
        [Display(Name = "Archivado")]
        public bool IsArchived { get; set; }
        [Display(Name = "Número de RC")]
        public int NumRc { get; set; }

        public bool IsLocal { get; set; }
        public List<string> Usuarios
        {
            get
            {
                _usuarios = _usuarios ?? this.GetUsuarios();
                return _usuarios;
            }
        }

        public int IdEstado
        {
            get
            {
                return Territories.Any() ? Territories.First().IdEstado : 0;
            }
        }

        public string Estado
        {
            get
            {
                return Territories.Any() ? Territories.First().Name : string.Empty;
            }
        }

        public DateTime BeginDate { get; set; }

        private List<TerritorioModel> _territories = null;
        private List<string> _usuarios = null;

        private List<string> GetUsuarios()
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.ProcesoUsuario
                    .Where(p => p.IdProceso == this.Id)
                    .AsEnumerable()
                    .Select(p => p.UserName).ToList();
            }
        }

    }
}
