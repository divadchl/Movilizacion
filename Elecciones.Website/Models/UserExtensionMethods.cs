using Elecciones.Logic;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using Elecciones.Website.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace Elecciones.Website
{
    public static partial class Extensions
    {
        public static bool IsInGroup(this IPrincipal user, string groups)
        {
            var groupManager = new ApplicationGroupManager();
            var userGroups = groupManager.GetUserGroups(user.Identity.GetUserId());
            foreach (var group in groups.Split(','))
            {
                if (userGroups.Any(p => p.Name.ToLower() == group.ToLower()))
                    return true;
            }
            return false;
        }
        public static void SetProcess(this IPrincipal user, Guid id, string name)
        {
            HttpContext.Current.Session["ProcessId"] = id;
            HttpContext.Current.Session["ProcessName"] = name;
        }
        public static bool HasProcessId(this IPrincipal user)
        {
            if (HttpContext.Current.Session != null)
                return HttpContext.Current.Session["ProcessId"] != null;
            return false;
        }
        public static Guid? GetProcessId(this IPrincipal user)
        {
            var idProceso = (Guid?)null;
            if (HttpContext.Current.Session["ProcessId"] != null)
                idProceso = (Guid)HttpContext.Current.Session["ProcessId"];

            return idProceso;
        }
        public static void ClearProcessId(this IPrincipal user)
        {
            if (HttpContext.Current.Session != null && HttpContext.Current.Session["ProcessId"] != null)
                HttpContext.Current.Session["ProcessId"] = null;
        }
        public static string GetProcessName(this IPrincipal user)
        {
            var name = string.Empty;
            if (HttpContext.Current.Session["ProcessName"] != null)
                name = (string)HttpContext.Current.Session["ProcessName"];

            return name;
        }
        public static int GetHierarchy(this IPrincipal user)
        {
            var groupManager = new ApplicationGroupManager();
            var _group = groupManager.GetUserGroups(user.Identity.GetUserId()).FirstOrDefault();
            return _group.Hierarchy;
        }
        public static List<string> GetRoles()
        {
            var roleNames = new List<string>();
            var roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();
            var groupManager = new ApplicationGroupManager();

            foreach (var groupRole in groupManager.GetUserGroupRoles(HttpContext.Current.User.Identity.GetUserId()))
            {
                var role = roleManager.FindById(groupRole.ApplicationRoleId);
                if (role != null)
                    roleNames.Add(role.Name);
            }
            return roleNames;
        }
        public static List<TerritorioModel> GetTerritoriosForProcess(this IPrincipal user, Guid idProceso)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.Territorio.Where(p => p.UserName == user.Identity.Name && p.IdProceso == idProceso)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(p)).ToList();

            }
        }
        public static List<TerritorioModel> GetTerritoriosForProcess(this ApplicationUser user, Guid idProceso)
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.Territorio.Where(p => p.UserName == user.UserName && p.IdProceso == idProceso)
                    .AsEnumerable()
                    .Select(p => new TerritorioModel(p)).ToList();
            }
        }
        public static List<TerritorioModel> GetEstadosForProcess(this IPrincipal user, Guid idProceso)
        {
            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetEstados();
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var result = new HashSet<TerritorioModel>();
                    var procesoSt = ProcesoManager.GetTerritorios(idProceso).ToList();
                    var userSt = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        userSt.Add(tr.GetEstados());

                    foreach (var st in procesoSt)
                        if (userSt.Any(p => p.IdEstado == st.IdEstado))
                            result.Add(st);

                    return result.ToList();
                }
            }
        }
        public static List<TerritorioModel> GetMunicipiosForProcess(this IPrincipal user, Guid idProceso, int idEstado)
        {
            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetMunicipios(idEstado);
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var proceso = ProcesoManager.GetProcesoById(idProceso);
                    var result = new HashSet<TerritorioModel>();
                    var procesoMun = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        if (tr.IdEstado == idEstado)
                            procesoMun.AddRange(TerritorioManager.GetMunicipios(tr.IdEstado));

                    var userMun = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        userMun.AddRange(tr.GetMunicipios(proceso.IdEncarte));

                    foreach (var mun in procesoMun)
                        if (userMun.Any(p => p.IdMunicipio == mun.IdMunicipio))
                            result.Add(mun);

                    return result.ToList();
                }
            }
        }
        public static List<TerritorioModel> GetMunicipiosForProcess(this IPrincipal user, Guid idProceso, int idEstado, int idDistritoFederal)
        {
            var proceso = ProcesoManager.GetProcesoById(idProceso);
            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetMunicipios(proceso.IdEncarte, idEstado, idDistritoFederal);
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var result = new HashSet<TerritorioModel>();
                    var procesoMun = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        if (tr.IdEstado == idEstado)
                            procesoMun.AddRange(TerritorioManager.GetMunicipios(tr.IdEstado));

                    var userMun = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        userMun.AddRange(tr.GetMunicipios(proceso.IdEncarte));


                    foreach (var mun in procesoMun)
                        if (userMun.Any(p => p.IdMunicipio == mun.IdMunicipio))
                            result.Add(mun);

                    return result.ToList();
                }
            }
        }
        //public static List<TupleModel> GetCodigosPostalesForProcess(this IPrincipal user, int idProceso, int idEstado, int idMunicipio)
        //{
        //    if (user.IsInGroup("System.Web.HttpContext.Current.Session["adminRoles"].ToString()"))
        //    {
        //        return TerritorioManager.GetCodigosPostales(idEstado, idMunicipio);
        //    }
        //    else
        //    {
        //        using (var ctx = new DBSElecccionesEntities())
        //        {
        //            var result = new HashSet<TupleModel>();
        //            var procesoCP = new List<TupleModel>();
        //            foreach (var estado in user.GetEstadosForProcess(idProceso))
        //                if (estado.Id == idEstado)
        //                    procesoCP.AddRange(TerritorioManager.GetCodigosPostales(idEstado, idMunicipio));

        //            var userCP = new List<TupleModel>();
        //            foreach (var tr in user.GetTerritoriosForProcess(idProceso))
        //                userCP.AddRange(tr.GetCodigosPostales());

        //            foreach (var cp in procesoCP)
        //                if (userCP.Any(p => p.Id == cp.Id))
        //                    result.Add(cp);

        //            return result.ToList();
        //        }
        //    }
        //}
        public static List<TerritorioModel> GetDistritosFederalesForProcess(this IPrincipal user, Guid idProceso, int idEstado)
        {
            var proceso = ProcesoManager.GetProcesoById(idProceso);
            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetDistritosFederales(proceso.IdEncarte, idEstado);
            }
            else
            {

                using (var ctx = new DBDeteccionEntities())
                {
                    var result = new HashSet<TerritorioModel>();
                    var procesoDf = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        if (tr.IdEstado == idEstado)
                            procesoDf.AddRange(TerritorioManager.GetDistritosFederales(proceso.IdEstado, tr.IdEstado));

                    var userDf = new List<TerritorioModel>();
                    foreach (var territorio in user.GetTerritoriosForProcess(idProceso))
                        userDf.AddRange(territorio.GetDistritosFederales(proceso.IdEncarte));

                    foreach (var df in userDf)
                        if (userDf.Any(p => p.IdDistritoFederal == df.IdDistritoFederal))
                            result.Add(df);

                    return result.ToList();
                }
            }
        }
        public static List<TerritorioModel> GetDistritosFederalesForProcess(this IPrincipal user, Guid idProceso, int idEstado, int idMunicipio)
        {
            var proceso = ProcesoManager.GetProcesoById(idProceso);

            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetDistritosFederales(proceso.IdEncarte, idEstado, idMunicipio);
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var result = new HashSet<TerritorioModel>();
                    var procesoDf = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        if (tr.IdEstado == idEstado)
                            procesoDf.AddRange(TerritorioManager.GetDistritosFederales(proceso.IdEncarte, tr.IdEstado, idMunicipio));

                    var userDf = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        userDf.AddRange(tr.GetDistritosFederales(proceso.IdEncarte));

                    foreach (var df in procesoDf)
                        if (userDf.Any(p => p.IdDistritoFederal == df.IdDistritoFederal))
                            result.Add(df);

                    return result.ToList();
                }
            }
        }
        public static List<TerritorioModel> GetDistritosLocalesForProcess(this IPrincipal user, Guid idProceso, int idEstado)
        {
            var proceso = ProcesoManager.GetProcesoById(idProceso);

            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.GetDistritosLocales(proceso.IdEncarte, idEstado);
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var result = new HashSet<TerritorioModel>();
                    var procesoDl = new List<TerritorioModel>();
                    foreach (var tr in user.GetTerritoriosForProcess(idProceso))
                        if (tr.IdEstado == idEstado)
                            procesoDl.AddRange(TerritorioManager.GetDistritosLocales(proceso.IdEncarte, tr.IdEstado));

                    var userDl = new List<TerritorioModel>();
                    foreach (var territorio in user.GetTerritoriosForProcess(idProceso))
                        userDl.AddRange(territorio.GetDistritosLocales(proceso.IdEncarte));

                    foreach (var dl in userDl)
                        if (userDl.Any(p => p.IdDistritoLocal == dl.IdDistritoLocal))
                            result.Add(dl);

                    return result.ToList();
                }
            }
        }
        public static List<TerritorioModel> GetSeccionesForProcess(this IPrincipal user, Guid idProceso, int idEstado, int? idDistritoFederal, int? idMunicipio)
        {
            var proceso = ProcesoManager.GetProcesoById(idProceso);

            if (user.IsInGroup(System.Web.HttpContext.Current.Session["adminRoles"].ToString()))
            {
                return TerritorioManager.Secciones(proceso.IdEncarte, idEstado, idDistritoFederal, idMunicipio);
            }
            else
            {
                using (var ctx = new DBDeteccionEntities())
                {
                    var secciones = new List<TerritorioModel>();
                    foreach (var territorio in user.GetTerritoriosForProcess(idProceso))
                        secciones.AddRange(territorio.GetSecciones(proceso.IdEncarte));

                    secciones = secciones.Where(p => p.IdEstado == idEstado).ToList();

                    if (idDistritoFederal.HasValue)
                        secciones = secciones.Where(p => p.IdDistritoFederal == idDistritoFederal).ToList();

                    if (idMunicipio.HasValue)
                        secciones = secciones.Where(p => p.IdMunicipio == idMunicipio).ToList();

                    return secciones.Distinct().ToList();
                }
            }
        }
    }
}