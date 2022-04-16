using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.News;
using Elecciones.Common.Models.Territory;
using Elecciones.Logic.Security;
using Elecciones.Logic.Territory;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic.News
{
    public class NewsManager
    {
        private bool isProcessByAdmin = false;
        private ProcesoModel proceso;
        private string userName;
        public NewsManager(bool isProcessByAdmin, string userName, ProcesoModel proceso)
        {
            this.isProcessByAdmin = isProcessByAdmin;
            this.proceso = proceso;
            this.userName = userName;
        }

        public List<NewDto> GetNews(List<VCriteria> criteria, Guid idProceso)
        {
            using (var context = new DBDeteccionEntities())
            {
                var filter = new TerritorioFilter(userName, proceso);
                var terBuilder = new ExpressionBuilder<DATNoticias>();
                criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
                var func = terBuilder.TransformExpression();
                var datNoticias = context.DATNoticias.Where(n => n.IdProceso == proceso.Id).Where(func).AsQueryable();

                if (!isProcessByAdmin)
                {
                    datNoticias = datNoticias.Where(p => filter.Estados.Contains(p.IdEstado.Value));
                    datNoticias = datNoticias.Where(p => !p.IdMunicipio.HasValue || filter.Municipios.Contains(p.IdMunicipio.Value));
                    datNoticias = datNoticias.Where(p => !p.IdDistritoFederal.HasValue || filter.DistritosFederales.Contains(p.IdDistritoFederal.Value));
                    datNoticias = datNoticias.Where(p => !p.IdDistritoLocal.HasValue || filter.DistritosLocales.Contains(p.IdDistritoLocal.Value));
                }

                return datNoticias.Select(n => new NewDto
                {
                    Activo = n.Activo ?? false,
                    Date = n.Fecha,
                    IdNoticia = n.IdNoticia,
                    Link = n.Link,
                    Titulo = n.Titulo,
                    Estado = n.CATEstado.Nombre,
                    Municipio = n.CATMunicipios.descripcion,
                    DistritoFederal = n.CATDistritoFederal.DistritoFederal,
                    DistritoLocal = n.CATDistritoLocal.DistritoLocal
                }).ToList();
            }
        }

        public NewDto GetNew(Guid idNoticia)
        {
            using (var context = new DBDeteccionEntities())
            {
                var noticia = context.DATNoticias.FirstOrDefault(n => n.IdNoticia == idNoticia);
                if (noticia != null)
                {
                    return new NewDto
                    {
                        Activo = noticia.Activo ?? false,
                        Date = noticia.Fecha,
                        IdNoticia = noticia.IdNoticia,
                        Link = noticia.Link,
                        Titulo = noticia.Titulo,
                        Estado = noticia.CATEstado?.Nombre,
                        Municipio = noticia.CATMunicipios?.descripcion,
                        DistritoFederal = noticia.CATDistritoFederal?.DistritoFederal,
                        DistritoLocal = noticia.CATDistritoLocal?.DistritoLocal
                    };
                }
                return null;
            }
        }

        public NewDto SaveNew(List<VCriteria> criteria, string title, string link)
        {
            using (var context = new DBDeteccionEntities())
            {
                var idEstado = criteria.Any(c => c.PropertyName == "IdEstado") ? criteria.First(c => c.PropertyName == "IdEstado").Value : null;
                var idMunicipio = criteria.Any(c => c.PropertyName == "IdMunicipio") ? criteria.First(c => c.PropertyName == "IdMunicipio").Value : null;
                var idDistritoFederal = criteria.Any(c => c.PropertyName == "IdDistritoFederal") ? criteria.First(c => c.PropertyName == "IdDistritoFederal").Value : null;
                var idDistritoLocal = criteria.Any(c => c.PropertyName == "IdDistritoLocal") ? criteria.First(c => c.PropertyName == "IdDistritoLocal").Value : null;
                var noticia = new DATNoticias
                {
                    Activo = true,
                    Fecha = DateTime.Now,
                    IdEstado = idEstado,
                    IdMunicipio = idMunicipio,
                    IdDistritoFederal = idDistritoFederal,
                    IdDistritoLocal = idDistritoLocal,
                    IdNoticia = Guid.NewGuid(),
                    Link = link,
                    Titulo = title,
                    InsertedUser = userName,
                    InsertedDate = DateTime.Now,
                    IdProceso = proceso.Id
                };
                context.DATNoticias.Add(noticia);
                context.SaveChanges();
                return GetNew(noticia.IdNoticia);
            }
        }

        public bool UpdateNew(Guid idNoticia, string title, string link)
        {
            using (var context = new DBDeteccionEntities())
            {
                var noticia = context.DATNoticias.FirstOrDefault(n => n.IdNoticia == idNoticia);
                if (noticia != null)
                {
                    noticia.Titulo = title;
                    noticia.Link = link;
                    noticia.ModifiedUser = userName;
                    noticia.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                }
                return true;
            }
        }

        public bool DeleteNew(Guid idNoticia)
        {
            using (var context = new DBDeteccionEntities())
            {
                var noticia = context.DATNoticias.FirstOrDefault(n => n.IdNoticia == idNoticia);
                if (noticia != null)
                {
                    context.DATNoticias.Remove(noticia);
                    context.SaveChanges();
                }
                return true;
            }
        }

        public bool ChangeStatusNew(Guid idNoticia)
        {
            using (var context = new DBDeteccionEntities())
            {
                var noticia = context.DATNoticias.FirstOrDefault(n => n.IdNoticia == idNoticia);
                if (noticia != null)
                {
                    noticia.Activo = !noticia.Activo ?? true;
                    noticia.ModifiedUser = userName;
                    noticia.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public static string GetBetween(string strSource, string strStart, string strEnd)
        {
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                int start = strSource.IndexOf(strStart, 0) + strStart.Length;
                int end = strSource.IndexOf(strEnd, start);
                return strSource.Substring(start, end - start);
            }

            return "";
        }
    }
}
