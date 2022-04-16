using Elecciones.Common.Models;
using Elecciones.Logic.Security;
using Elecciones.Website.Models.Api;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Website.Helpers
{
    public class UsersHelper : IDisposable
    {
        private static ApplicationDbContext userContext = new ApplicationDbContext();

        public static (ApplicationUser user, ProcesoModel process) GetUserASP(string userName)
        {
            ProcesoModel process = new ProcesoModel();
            UserManager<ApplicationUser> userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(userContext));
            ApplicationUser user = userManager.FindByName(userName);
            if (user != null)
            {
                List<ProcesoModel> listProcess = ProcesoManager.GetProcesosForUser(userName);
                if (listProcess.Any())
                {
                    ProcesoModel processForUser = listProcess.FirstOrDefault();
                    process = ProcesoManager.GetProcesoById(processForUser.Id);
                }
            }
            return (user, process);
        }
        
        public void Dispose()
        {
            userContext.Dispose();
        }
    }
}