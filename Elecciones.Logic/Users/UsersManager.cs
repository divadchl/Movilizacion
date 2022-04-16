using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Users;
using Elecciones.Logic.Security;
using Elecciones.Logic.Territory;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Models.IdentityModels;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic.Users
{
    public class UsersManager
    {
        private bool isProcessByAdmin = false;
        private ProcesoModel proceso;
        private string userName;
        private TerritorioFilter filter;

        public UsersManager(bool isProcessByAdmin, string userName, ProcesoModel proceso)
        {
            this.isProcessByAdmin = isProcessByAdmin;
            this.proceso = proceso;
            this.userName = userName;
            filter = new TerritorioFilter(userName, proceso);
        }

        public List<UserDto> GetUsers(int userHerarchy)
        {
            var usernameList = new List<string>();
            using (var context = new DBDeteccionEntities())
            {
                usernameList = context.DATProceso.First(u => u.IdProceso == proceso.Id)
                    .ProcesoUsuario.Select(u => u.UserName).ToList();
            }

            using (var context = new DBSMovilizacionIdentityEntities())
            {
                var userIdList = context.AspNetUsers.Where(u => usernameList.Contains(u.UserName)).Select(u => u.Id).ToList();
                var validUsersList = context.ApplicationUserGroups.Where(u => userIdList.Contains(u.ApplicationUserId) && u.ApplicationGroups.Hierarchy > userHerarchy)
                    .Select(u => u.ApplicationUserId).ToList();

                var usersReturn = context.AspNetUsers.Where(u => validUsersList.Contains(u.Id))
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Nombre = u.Nombre,
                        ApellidoMaterno = u.Materno,
                        ApellidoPaterno = u.Paterno,
                        Correo = u.Email,
                        Telefono = u.Telefono,
                        Username = u.UserName
                    }).ToList();

                foreach (var user in usersReturn)
                {
                    var ApplicationGroup = context.ApplicationUserGroups.FirstOrDefault(u => u.ApplicationUserId.ToString() == user.Id);
                    if (ApplicationGroup != null)
                    {
                        var perfil = context.ApplicationGroups.FirstOrDefault(p => p.Id == ApplicationGroup.ApplicationGroupId);
                        if (perfil != null)
                        {
                            user.Perfil = perfil.Name;
                        }
                    }
                }

                return usersReturn;

            }
        }

        public bool ExistsUser(string username)
        {
            using (var context = new DBSMovilizacionIdentityEntities())
            {
                return context.AspNetUsers.Any(u => u.UserName.Equals(username, StringComparison.InvariantCultureIgnoreCase));
            }
        }

        public bool AddTerritorio(string userName, List<VCriteria> criteria)
        {
            using (var context = new DBDeteccionEntities())
            {
                var idEstado = criteria.Any(c => c.PropertyName == "IdEstado") ? criteria.First(c => c.PropertyName == "IdEstado").Value : null;
                var idMunicipio = criteria.Any(c => c.PropertyName == "IdMunicipio") ? criteria.First(c => c.PropertyName == "IdMunicipio").Value : null;
                var idDistritoFederal = criteria.Any(c => c.PropertyName == "IdDistritoFederal") ? criteria.First(c => c.PropertyName == "IdDistritoFederal").Value : null;
                var idDistritoLocal = criteria.Any(c => c.PropertyName == "IdDistritoLocal") ? criteria.First(c => c.PropertyName == "IdDistritoLocal").Value : null;
                var idSeccion = criteria.Any(c => c.PropertyName == "IdSeccion") ? criteria.First(c => c.PropertyName == "IdSeccion").Value : null;

                var territorio = new Territorio
                {
                    IdProceso = proceso.Id,
                    UserName = userName,
                    IdEstado = idEstado,
                    IdDistritoFederal = idDistritoFederal,
                    IdDistritoLocal = idDistritoLocal,
                    IdMunicipio = idMunicipio,
                    IdSeccion = idSeccion
                };
                context.Territorio.Add(territorio);
                context.SaveChanges();
                return true;
            }
        }

        public bool DeleteTerritory(string username, int territoryId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var territory = context.Territorio.FirstOrDefault(t => t.IdTerritorio == territoryId && t.UserName.Equals(username, StringComparison.CurrentCultureIgnoreCase));
                if (territory != null)
                {
                    context.Territorio.Remove(territory);
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public bool DeleteAllTerritory(string username)
        {
            using (var context = new DBDeteccionEntities())
            {
                var territory = context.Territorio.Where(t => t.UserName.Equals(username, StringComparison.CurrentCultureIgnoreCase));
                if (territory != null && territory.Any())
                {
                    context.Territorio.RemoveRange(territory);
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

    }
}
