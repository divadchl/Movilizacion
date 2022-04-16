using Elecciones.Common.Models;
using Elecciones.Logic.Services;
using System;
using System.Threading.Tasks;

namespace Elecciones.Logic.Deteccion
{
    public class Notifications
    {
        public async Task<bool> UpdateRegisterDevice(
            int numberSection, 
            int numberState, 
            Guid idPerson, 
            Guid idProcess, 
            DeviceRegistration registrationDevice)
        {
            try
            {
                //if (string.IsNullOrEmpty(registrationDevice.RegistrationId))
                    //return false;

                NotificationsService notificationsService = new NotificationsService();
                Section section = await new Sections().GetSection(numberSection, numberState);
                if (section == null)
                    return false;

                await notificationsService.UpdateRegistrationAsync(registrationDevice, section, idPerson, idProcess);
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
