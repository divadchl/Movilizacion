using Elecciones.Common.Models;
using Elecciones.Logic.Services;
using System;
using System.Threading.Tasks;

namespace Elecciones.Logic.Movilizacion
{
    public class NotificationsMov
    {
        public async Task<bool> UpdateRegisterDevice(int idTerritory, Guid idProcess, string username, DeviceRegistration registrationDevice)
        {
            try
            {
                NotificationsMovService notificationsMovService = new NotificationsMovService();
                await notificationsMovService.UpdateRegistrationAsync(idTerritory, idProcess, username, registrationDevice);
                return true;
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return false;
            }
        }
    }
}
