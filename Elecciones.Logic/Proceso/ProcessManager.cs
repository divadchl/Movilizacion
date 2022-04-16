using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Proceso;
using Elecciones.Common.Models.Territory;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Elecciones.Logic.Proceso
{
    public class ProcessManager
    {

        public ProcessDto SaveProcess(ProcessDto proceso, string username)
        {
            using (var context = new DBDeteccionEntities())
            {
                var fechaProceso = DateTime.ParseExact(proceso.FechaProceso, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var process = new DATProceso
                {
                    IdProceso = Guid.NewGuid(),
                    Nombre = proceso.Proceso,
                    Local = proceso.IsLocal,
                    FechaProceso = fechaProceso,
                    Archivado = false,
                    Activo = false,
                    AddUser = username,
                    AddDate = DateTime.Now,
                    IdEncarte = proceso.IdEncarte,
                    IdEstado = proceso.IdEstado
                };
                context.DATProceso.Add(process);
                context.SaveChanges();
                return GetProcessById(process.IdProceso);
            }
        }

        public ProcessDto GetProcessById(Guid idProceso)
        {
            using (var context = new DBDeteccionEntities())
            {
                var process = context.DATProceso.FirstOrDefault(p => p.IdProceso == idProceso);
                if (process != null)
                {
                    var date = process.FechaProceso.ToString("dd/MM/yyyy");
                    return new ProcessDto
                    {
                        IdProceso = process.IdProceso,
                        Proceso = process.Nombre,
                        IsLocal = process.Local,
                        FechaProceso = date,
                        Activo = process.Activo,
                        IdEncarte = process.IdEncarte,
                        IdEstado = process.IdEstado,
                        Estado = process.CATEstado.Nombre
                    };
                }
                return null;
            }
        }

        public List<ProcessDto> GetProcesos(List<VCriteria> criteria)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var terBuilder = new ExpressionBuilder<DATProceso>();
                criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
                var func = terBuilder.TransformExpression();

                var data = ctx.DATProceso.Where(func)
                    .Select(p => new ProcesoModel
                    {
                        Id = p.IdProceso,
                        Name = p.Nombre,
                        Date = p.FechaProceso,
                        IsArchived = p.Archivado,
                        IsLocal = p.Local
                    }).OrderBy(p => p.Name).ToList();

                return data.Select(e => GetProcessById(e.Id)).ToList();
            }
        }


        public bool EditProcess(Guid idProceso, string name)
        {
            using (var context = new DBDeteccionEntities())
            {
                var process = context.DATProceso.FirstOrDefault(p => p.IdProceso == idProceso);
                if (process != null)
                {
                    process.Nombre = name;
                    context.SaveChanges();
                }
                return true;
            }
        }

        public List<EncarteDto> GetEncartes()
        {
            using (var context = new DBDeteccionEntities())
            {
                return context.Encarte.Select(e => new EncarteDto
                {
                    IdEncarte = e.IdEncarte,
                    Descripcion = e.Descripcion
                }).ToList();
            }
        }

        public bool ChangeStatusProcess(Guid idProceso)
        {
            using (var context = new DBDeteccionEntities())
            {
                var process = context.DATProceso.FirstOrDefault(p => p.IdProceso == idProceso);
                if (process != null)
                {
                    process.Activo = !process.Activo;
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

    }
}
