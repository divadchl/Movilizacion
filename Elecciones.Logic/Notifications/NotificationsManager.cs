using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Notifications;
using Elecciones.Common.Models.Territory;
using Elecciones.Logic.Security;
using Elecciones.Logic.Territory;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elecciones.Logic.Notifications
{
    public class NotificationsManager
    {
        bool isProcessByAdmin = false;
        private ProcesoModel proceso;
        private string userName;

        public NotificationsManager(bool isProcessByAdmin, string userName, ProcesoModel proceso)
        {
            this.isProcessByAdmin = isProcessByAdmin;
            this.proceso = proceso;
            this.userName = userName;
        }

        public NotificationDto CreateNotification(List<VCriteria> criteria, NotificationDto notificacionDto)
        {
            using (var context = new DBDeteccionEntities())
            {
                var idEstado = criteria.Any(c => c.PropertyName == "IdEstado") ? criteria.First(c => c.PropertyName == "IdEstado").Value : null;
                var idMunicipio = criteria.Any(c => c.PropertyName == "IdMunicipio") ? criteria.First(c => c.PropertyName == "IdMunicipio").Value : null;
                var idDistritoFederal = criteria.Any(c => c.PropertyName == "IdDistritoFederal") ? criteria.First(c => c.PropertyName == "IdDistritoFederal").Value : null;
                var idDistritoLocal = criteria.Any(c => c.PropertyName == "IdDistritoLocal") ? criteria.First(c => c.PropertyName == "IdDistritoLocal").Value : null;

                var notificacion = new DATNotificaciones
                {
                    IdNotificacion = Guid.NewGuid(),
                    Aplicacion = notificacionDto.Aplicacion,
                    Enviada = true,
                    Fecha = DateTime.Now,
                    IdDistritoFederal = idDistritoFederal,
                    IdDistritoLocal = idDistritoLocal,
                    IdEstado = idEstado,
                    IdMunicipio = idMunicipio,
                    IdProceso = proceso.Id,
                    InsertedDate = DateTime.Now,
                    InsertedUser = userName,
                    Titulo = notificacionDto.Titulo,
                    Notificacion = notificacionDto.Mensaje
                };

                context.DATNotificaciones.Add(notificacion);
                context.SaveChanges();
                return GetNotification(notificacion.IdNotificacion);
            }
        }


        public NotificationDto GetNotification(Guid notificationId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var notification = context.DATNotificaciones.FirstOrDefault(n => n.IdNotificacion== notificationId);
                if (notificationId != null)
                {
                    return new NotificationDto
                    {
                        Id = notification.IdNotificacion,
                        Aplicacion = notification.Aplicacion,
                        Enviada = notification.Enviada,
                        Mensaje = notification.Notificacion,
                        Titulo = notification.Titulo,
                        Fecha = notification.Fecha.ToString(),
                        Territorio = string.Concat("E:", notification.CATEstado.Nombre, "->", (notification.IdMunicipio != null ? "M:" + notification.CATMunicipios.municipio + "->" : ""), (notification.IdDistritoFederal != null ? "DF:" + 
                        notification.CATDistritoFederal.DistritoFederal.ToString() + "->" : ""), (notification.IdDistritoLocal != null ? "DL:" + notification.CATDistritoLocal.DistritoLocal.ToString() + "->" : ""))
                    };
                }

                return null;
            }
        }


        public List<NotificationDto> GetNotifications(List<VCriteria> criteria)
        {
            using (var context = new DBDeteccionEntities())
            {
                var filter = new TerritorioFilter(userName, proceso);

                var terBuilder = new ExpressionBuilder<DATNotificaciones>();
                criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
             
                var func = terBuilder.TransformExpression();
                var datNotificaciones = context.DATNotificaciones.Where(n => n.IdProceso == proceso.Id).Where(func).AsQueryable();
                if (!isProcessByAdmin)
                {
                    datNotificaciones = datNotificaciones.Where(p => filter.Estados.Contains(p.IdEstado.Value));
                    datNotificaciones = datNotificaciones.Where(p => !p.IdMunicipio.HasValue || filter.Municipios.Contains(p.IdMunicipio.Value));
                    datNotificaciones = datNotificaciones.Where(p => !p.IdDistritoFederal.HasValue || filter.DistritosFederales.Contains(p.IdDistritoFederal.Value));
                    datNotificaciones = datNotificaciones.Where(p => !p.IdDistritoLocal.HasValue || filter.DistritosLocales.Contains(p.IdDistritoLocal.Value));
                }


                //var dATNotificaciones = isProcessByAdmin
                //    ? context.DATNotificaciones
                //    : context.DATNotificaciones.Where(func).Where(p => filter.Estados.Contains(p.IdEstado.Value) &&
                //                                     filter.Municipios.Contains(p.IdMunicipio.Value) &&
                //                                     filter.DistritosFederales.Contains(p.IdDistritoFederal.Value) &&
                //                                     filter.DistritosLocales.Contains(p.IdDistritoLocal.Value));

                return datNotificaciones
                    .Select(n => new NotificationDto
                    {
                        Id = n.IdNotificacion,
                        Aplicacion = n.Aplicacion,
                        Enviada = n.Enviada,
                        Mensaje = n.Notificacion,
                        Titulo = n.Titulo,
                        Fecha = n.Fecha.ToString(),
                        Territorio = string.Concat("E:", n.CATEstado.Nombre, "->", (n.IdMunicipio != null ? "M:" + n.CATMunicipios.municipio + "->" : ""), (n.IdDistritoFederal != null ? "DF:" + n.CATDistritoFederal.DistritoFederal.ToString() + "->" : ""), (n.IdDistritoLocal != null ? "DL:" + n.CATDistritoLocal.DistritoLocal.ToString() + "->" : ""))
                    }).ToList();
            }
        }
    }
}
