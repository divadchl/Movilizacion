using Elecciones.Common.Models;
using Elecciones.Logic.Business;
using Elecciones.Models.DBSMovilizacion;
using Microsoft.Azure.NotificationHubs;
using Microsoft.Azure.NotificationHubs.Messaging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Elecciones.Logic.Services
{
    /// <summary>
    ///Envía notificaciones
    /// </summary>
    public class NotificationsService
    {
        NotificationHubClient hub;

        public NotificationsService()
        {
            hub = NotificationHubClient.CreateClientFromConnectionString(
                DispatcherConstants.FullAccessConnectionString,
                DispatcherConstants.NotificationHubName);
        }

        #region [ Register Device Notification]
        
        public async Task UpdateRegistrationAsync(
            DeviceRegistration deviceUpdate, 
            Section section, 
            Guid idPerson, 
            Guid idProcess)
        {
            RegistrationDescription registerDevice = null;

            if (deviceUpdate.RegistrationType.Equals("fcm"))
            {
                RegistrationDescription registerDeviceTemplate = null;
                registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                registerDeviceTemplate = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationTemplateId);
                registerDevice.Tags = new HashSet<string>(DispatcherConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"section:{idProcess}_{section.IdSection}");
                registerDevice.Tags.Add($"state:{idProcess}_{section.IdState}");
                registerDevice.Tags.Add($"municipality:{idProcess}_{section.IdMunicipality}");
                registerDevice.Tags.Add($"federaldistrict:{idProcess}_{section.IdFederalDistrict}");
                registerDevice.Tags.Add($"localdistrict:{idProcess}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"federallocaldistrict:{idProcess}_{section.IdFederalDistrict}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"idPerson:{idPerson}");
                registerDeviceTemplate.Tags = registerDevice.Tags;

                try
                {
                    await hub.UpdateRegistrationAsync(registerDevice);
                    await hub.UpdateRegistrationAsync(registerDeviceTemplate);
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return;
                }
            }
            else if (deviceUpdate.RegistrationType.Equals("apns"))
            {
                CollectionQueryResult<RegistrationDescription> listDevice = await hub.GetRegistrationsByChannelAsync(deviceUpdate.PNSHandle, 0);

                foreach (var device in listDevice)
                    deviceUpdate.RegistrationId = device.RegistrationId;

                registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                registerDevice.Tags = new HashSet<string>(DispatcherConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"section:{idProcess}_{section.IdSection}");
                registerDevice.Tags.Add($"state:{idProcess}_{section.IdState}");
                registerDevice.Tags.Add($"municipality:{idProcess}_{section.IdMunicipality}");
                registerDevice.Tags.Add($"federaldistrict:{idProcess}_{section.IdFederalDistrict}");
                registerDevice.Tags.Add($"localdistrict:{idProcess}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"federallocaldistrict:{idProcess}_{section.IdFederalDistrict}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"idPerson:{idProcess}_{idPerson}");

                try
                {
                    await hub.UpdateRegistrationAsync(registerDevice);
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return;
                }
            }
            
            return;
        }
        #endregion [ Register Device Notification ]

        #region [ Send Notifications ]

        public async Task<bool> SendNotificationiOSAsync(NotificationPushiOS notificationPushiOS, string[] tags)
        {
            string alert = JsonConvert.SerializeObject(notificationPushiOS);
            NotificationOutcome outcome = await hub.SendAppleNativeNotificationAsync(alert, tags);

            if (outcome != null)
            {
                if (!((outcome.State == NotificationOutcomeState.Abandoned) ||
                    (outcome.State == NotificationOutcomeState.Unknown)))
                {
                    return true;
                }
            }

            return false;
        }

        public async Task<bool> SendNotificationAndroidAsync(NotificationPush notification, string[] tags)
        {
            try
            {
                Dictionary<string, string> templateParameters = new Dictionary<string, string>();
                string notif = JsonConvert.SerializeObject(notification);
                templateParameters["messageParam"] = notif;
                NotificationOutcome outcome = await hub.SendTemplateNotificationAsync(templateParameters, tags);
                if (outcome != null)
                    if (!((outcome.State == NotificationOutcomeState.Abandoned) || (outcome.State == NotificationOutcomeState.Unknown)))
                        return true;
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return false;
            }

            return false;
        }
        #endregion [ Send Notifications ]

        #region [ UpdateTags ]

        public async Task<bool> UpdateTagsAsync(string filterTag, string tag, bool delete = false)
        {
            try
            {
                List<RegistrationDescription> listDevices = ListDevicesDet()
                        .Where(x => x.Tags.Contains(filterTag))
                        .ToList();

                foreach (var device in listDevices)
                {
                    string tagVote = device.Tags.SingleOrDefault(x => x.Contains(tag));
                    if (tagVote != null)
                        device.Tags.Remove(tagVote);

                    DeviceRegistration deviceRegistration = new DeviceRegistration
                    {
                        PNSHandle = device.PnsHandle,
                        RegistrationId = device.RegistrationId,
                        RegistrationTemplateId = device.GetType().Name.Equals("FcmRegistrationDescription") ? null : device.RegistrationId,
                        RegistrationType = device.GetType().Name.Equals("AppleRegistrationDescription") ? "apns" : "fcm",
                        Tags = device.Tags.ToList()
                    };

                    if (!delete)
                        deviceRegistration.Tags.Add(tag);

                    bool result = await UpdateDeviceAsync(deviceRegistration);
                }
                
                return true;
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return false;
            }
        }

        public async Task<bool> UpdateTagAsync(string filterTag, string tag, bool delete = false)
        {
            try
            {
                RegistrationDescription device = ListDevicesDet()
                        .FirstOrDefault(x => x.Tags.Contains(filterTag));
                
                string tagVote = device.Tags.SingleOrDefault(x => x.Contains(tag));
                if (tagVote != null)
                    device.Tags.Remove(tagVote);

                DeviceRegistration deviceRegistration = new DeviceRegistration
                {
                    PNSHandle = device.PnsHandle,
                    RegistrationId = device.RegistrationId,
                    RegistrationTemplateId = device.GetType().Name.Equals("FcmRegistrationDescription") ? null : device.RegistrationId,
                    RegistrationType = device.GetType().Name.Equals("AppleRegistrationDescription") ? "apns" : "fcm",
                    Tags = device.Tags.ToList()
                };

                if (!delete)
                    deviceRegistration.Tags.Add(tag);

                bool result = await UpdateDeviceAsync(deviceRegistration);

                return result;
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                return false;
            }
        }


        private async Task<bool> UpdateDeviceAsync(DeviceRegistration deviceUpdate)
        {
            RegistrationDescription registerDevice = null;

            if (deviceUpdate.RegistrationType.Equals("fcm"))
            {
                try
                {
                    if(deviceUpdate.RegistrationId != null)
                    {
                        registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                        registerDevice.Tags = new HashSet<string>(deviceUpdate.Tags);
                        await hub.UpdateRegistrationAsync(registerDevice);
                    }
                    
                    if(deviceUpdate.RegistrationTemplateId != null)
                    {
                        RegistrationDescription registerDeviceTemplate = null;
                        registerDeviceTemplate = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationTemplateId);
                        registerDeviceTemplate.Tags = new HashSet<string>(deviceUpdate.Tags);
                        await hub.UpdateRegistrationAsync(registerDeviceTemplate);
                    }
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return false;
                }
            }
            else if (deviceUpdate.RegistrationType.Equals("apns"))
            {
                try
                {
                    CollectionQueryResult<RegistrationDescription> listDevice = await hub.GetRegistrationsByChannelAsync(deviceUpdate.PNSHandle, 0);

                    foreach (var device in listDevice)
                        deviceUpdate.RegistrationId = device.RegistrationId;

                    registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                    registerDevice.Tags = new HashSet<string>(deviceUpdate.Tags);
                    await hub.UpdateRegistrationAsync(registerDevice);
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return false;
                }
            }

            return true;
        }

        #endregion [ UpdateTags ]

        //TODO Eliminar éstos métoso que sirven para eliminar un dispositivo del registro de notificaciones
        #region [ Delete Device Notification ]
        public async Task DeleteRegistrationAsync(string registrationId)
        {
            await hub.DeleteRegistrationAsync(registrationId);
        }

        public async Task DeleteAllRegistrationAsync()
        {
            var allRegistrations = hub.GetAllRegistrationsAsync(0).Result;
            foreach (var item in allRegistrations)
            {
                var id = item.RegistrationId;
                await hub.DeleteRegistrationAsync(id);
            }
        }

        public List<RegistrationDescription> ListDevicesDet()
        {
            CollectionQueryResult<RegistrationDescription> allRegistrations = hub.GetAllRegistrationsAsync(0).Result;
            List<RegistrationDescription> list = new List<RegistrationDescription>();
            foreach (var item in allRegistrations)
            {
                list.Add(item);
            }
            return list;
        }

        public async Task UpdateChangesAsync(
            DeviceRegistration deviceUpdate,
            Section section,
            Guid idPerson,
            Guid idProcess)
        {
            RegistrationDescription registerDevice = null;

            if (deviceUpdate.RegistrationType.Equals("fcm"))
            {
                registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                registerDevice.Tags = new HashSet<string>(DispatcherConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"section:{idProcess}_{section.IdSection}");
                registerDevice.Tags.Add($"state:{idProcess}_{section.IdState}");
                registerDevice.Tags.Add($"municipality:{idProcess}_{section.IdMunicipality}");
                registerDevice.Tags.Add($"federaldistrict:{idProcess}_{section.IdFederalDistrict}");
                registerDevice.Tags.Add($"localdistrict:{idProcess}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"federallocaldistrict:{idProcess}_{section.IdFederalDistrict}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"idPerson:{idPerson}");

                try
                {
                    await hub.UpdateRegistrationAsync(registerDevice);
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return;
                }
            }
            else if (deviceUpdate.RegistrationType.Equals("apns"))
            {
                CollectionQueryResult<RegistrationDescription> listDevice = await hub.GetRegistrationsByChannelAsync(deviceUpdate.PNSHandle, 0);

                foreach (var device in listDevice)
                    deviceUpdate.RegistrationId = device.RegistrationId;

                registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                registerDevice.Tags = new HashSet<string>(DispatcherConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"section:{idProcess}_{section.IdSection}");
                registerDevice.Tags.Add($"state:{idProcess}_{section.IdState}");
                registerDevice.Tags.Add($"municipality:{idProcess}_{section.IdMunicipality}");
                registerDevice.Tags.Add($"federaldistrict:{idProcess}_{section.IdFederalDistrict}");
                registerDevice.Tags.Add($"localdistrict:{idProcess}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"federallocaldistrict:{idProcess}_{section.IdFederalDistrict}_{section.IdLocalDistrict}");
                registerDevice.Tags.Add($"idPerson:{idProcess}_{idPerson}");

                try
                {
                    await hub.UpdateRegistrationAsync(registerDevice);
                }
                catch (MessagingException ex)
                {
                    var message = ex.Message;
                    return;
                }
            }

            return;
        }
        #endregion [ Delete Device Notification ]
    }
}
