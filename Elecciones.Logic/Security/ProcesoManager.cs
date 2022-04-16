using Elecciones.Models.DBSMovilizacion;
using Elecciones.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Elecciones.Logic.Security
{
    public static class ProcesoManager
    {
        public static List<ProcesoModel> GetProcesos()
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.DATProceso
                    .Where(p => p.Activo)
                    .Select(p => new ProcesoModel
                    {
                        Id = p.IdProceso,
                        Name = p.Nombre,
                        Date = p.FechaProceso,
                        IsArchived = p.Archivado,
                        IsLocal = p.Local
                    }).OrderBy(p => p.Name).ToList();
            }
        }

        public static List<ProcesoModel> GetProcesosForUser(string userName)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.ProcesoUsuario
                    .Where(p => p.UserName == userName && p.DATProceso.Activo)
                    .Select(p => new ProcesoModel
                    {
                        Id = p.IdProceso,
                        Name = p.DATProceso.Nombre,
                        Date = p.DATProceso.FechaProceso,
                        IsArchived = p.DATProceso.Archivado
                    })
                    .OrderBy(p => p.Name).ToList();
            }
        }

        public static ProcesoModel GetProcesoById(Guid id)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var proc = ctx.DATProceso.FirstOrDefault(p => p.IdProceso == id && p.Activo);
                return new ProcesoModel
                {
                    Id = proc.IdProceso,
                    Name = proc.Nombre,
                    Date = proc.FechaProceso,
                    IdEncarte = proc.IdEncarte,
                    Encarte = proc.Encarte.Descripcion,
                    IsArchived = proc.Archivado,
                    IsLocal = proc.Local,
                    BeginDate = proc.AddDate
                };
            }
        }

        public static DATProceso GetProcesoEntity(Guid id)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.DATProceso.FirstOrDefault(p => p.IdProceso == id);
            }
        }

        public static bool Create(DATProceso proceso, string userName)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                try
                {
                    proceso.AddDate = DateTime.Now;
                    proceso.AddUser = userName;
                    ctx.DATProceso.Add(proceso);
                    ctx.SaveChanges();
                    return true;
                }
                catch (Exception ex)
                {
                    var x = ex.Message;
                    return false;
                }
            }
        }

        public static bool Edit(DATProceso proceso)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                try
                {
                    ctx.Entry(proceso).State = EntityState.Modified;
                    ctx.SaveChanges();
                    return true;
                }
                catch 
                {
                    return false;
                }
            }
        }

        public static bool Delete(DATProceso proceso)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                ctx.DATProceso.Remove(proceso);
                ctx.SaveChanges();
                return true;
            }
        }

        public static bool AddUsuarios(Guid proceso, string[] usuarios)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                foreach (var usuario in usuarios)
                {
                    ctx.ProcesoUsuario.Add(new ProcesoUsuario { IdProceso = proceso, UserName = usuario });
                }
                ctx.SaveChanges();
                return true;
            }
        }

        public static void RemoveUsuario(Guid idProceso, string userName)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var procesoUsuario = ctx.ProcesoUsuario.FirstOrDefault(p => p.UserName == userName && p.IdProceso == idProceso);
                ctx.ProcesoUsuario.Remove(procesoUsuario);
                ctx.SaveChanges();
            }
        }

        public static void RemoveUsuario(string userName)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                var up = ctx.ProcesoUsuario.Where(p => p.UserName == userName);
                ctx.ProcesoUsuario.RemoveRange(up);
                ctx.SaveChanges();
            }
        }

        public static List<TerritorioModel> GetTerritorios(Guid idProceso)
        {
            var result = new List<TerritorioModel>();
            using (var ctx = new DBDeteccionEntities())
            {
                var territorios = ctx.Territorio.Where(p => p.IdProceso == idProceso && string.IsNullOrEmpty(p.UserName)).ToList();
                foreach (var item in territorios)
                {
                    result.Add(new TerritorioModel(item));
                }
            }
            return result;
        }


        public static ResultViewModel SetProcesos(string userName, params string[] selectedProcesos)
        {
            using (var ctx = new DBDeteccionEntities())
            {

                ctx.ProcesoUsuario.RemoveRange(ctx.ProcesoUsuario.Where(p => p.UserName == userName));
                ctx.SaveChanges();

                foreach (var procesoId in selectedProcesos)
                {
                    var pu = new ProcesoUsuario();
                    pu.IdProceso = Guid.Parse(procesoId);
                    pu.UserName = userName;
                    ctx.ProcesoUsuario.Add(pu);
                    ctx.SaveChanges();
                }

                return new ResultViewModel();
            }
        }
    }
}
