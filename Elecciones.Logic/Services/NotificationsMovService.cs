using Elecciones.Common.Models;
using Elecciones.Logic.Business;
using Microsoft.Azure.NotificationHubs;
using Microsoft.Azure.NotificationHubs.Messaging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Elecciones.Logic.Services
{
    public class NotificationsMovService
    {
        NotificationHubClient hub;

        public NotificationsMovService()
        {
            hub = NotificationHubClient.CreateClientFromConnectionString(
                DispatcherMovConstants.FullAccessConnectionString,
                DispatcherMovConstants.NotificationHubName);
        }

        #region [ Register Device Notification]

        public async Task UpdateRegistrationAsync(
            int idTerritory, 
            Guid idProcess, 
            string username, 
            DeviceRegistration deviceUpdate)
        {
            RegistrationDescription registerDevice = null;

            if (deviceUpdate.RegistrationType.Equals("fcm"))
            {
                RegistrationDescription registerDeviceTemplate = null;
                registerDevice = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationId);
                registerDeviceTemplate = await hub.GetRegistrationAsync<RegistrationDescription>(deviceUpdate.RegistrationTemplateId);
                registerDevice.Tags = new HashSet<string>(DispatcherMovConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"territory:{idProcess}_{idTerritory}");
                registerDevice.Tags.Add($"process:{idProcess}");
                registerDevice.Tags.Add($"username:{username}");
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
                registerDevice.Tags = new HashSet<string>(DispatcherMovConstants.SubscriptionTags);
                registerDevice.Tags.Add($"all");
                registerDevice.Tags.Add($"territory:{idProcess}_{idTerritory}");
                registerDevice.Tags.Add($"process:{idProcess}");
                registerDevice.Tags.Add($"username:{username}");

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

        public List<RegistrationDescription> ListDevicesMov()
        {
            CollectionQueryResult<RegistrationDescription> allRegistrations = hub.GetAllRegistrationsAsync(0).Result;
            List<RegistrationDescription> list = new List<RegistrationDescription>();
            foreach (var item in allRegistrations)
            {
                list.Add(item);
            }
            return list;
        }
        #endregion [ Delete Device Notification ]
    }
}

