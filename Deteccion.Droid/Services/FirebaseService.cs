using Android.App;
using Android.Content;
using Android.OS;
using Android.Support.V4.App;
using Android.Util;
using Deteccion.Helpers;
using Elecciones.Common.Business;
using Elecciones.Common.Models;
using Firebase.Messaging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WindowsAzure.Messaging;
using Xamarin.Essentials;

namespace Deteccion.Droid.Services
{
    [Service]
    [IntentFilter(new[] { "com.google.firebase.MESSAGING_EVENT" })]
    public class FirebaseService : FirebaseMessagingService
    {
        NotificationPush notificationPush = new NotificationPush();

        public override void OnMessageReceived(RemoteMessage message)
        {
            base.OnMessageReceived(message);

            if (message.GetNotification() != null)
            {
                notificationPush.Notification.Body = message.GetNotification().Body;
                notificationPush.Notification.Title = message.GetNotification().Title;
                notificationPush.Notification.Tag = message.GetNotification().Tag;
                IDictionary<string, string> data = message.Data;
                //foreach (var item in data)
                //    notificationPush.Data.Id = new Guid(item.Value);
                notificationPush.Data.Id = new Guid(data["id"]);
                notificationPush.Data.Value = data["value"];

                SendLocalNotification(message.GetNotification().Body);
            }
            else
            {
                //Only used for debugging payloads sent from the Azure portal
                string messageData = message.Data.Values.First();
                notificationPush = JsonConvert.DeserializeObject<NotificationPush>(messageData);
                notificationPush.Notification.Body = notificationPush.Notification.Body;
                notificationPush.Notification.Title = notificationPush.Notification.Title;
                notificationPush.Notification.Tag = notificationPush.Notification.Tag;
                notificationPush.Data.Id = notificationPush.Data.Id;
                notificationPush.Data.Value = notificationPush.Data.Value;
                SendLocalNotification(notificationPush.Notification.Body);
            }

            // send the incoming message directly to the MainPage
            SendMessageToMainPage();
        }

        public override void OnNewToken(string token)
        {
            // TODO: save token instance locally, or log if desired
            SendRegistrationToServer(token);
        }

        private void SendRegistrationToServer(string token)
        {
            try
            {
                NotificationHub hub = new NotificationHub(AppConstants.NotificationHubName, AppConstants.ListenConnectionString, this);

                // register device with Azure Notification Hub using the token from FCM
                Registration registration = hub.Register(token, AppConstants.SubscriptionTags);
                DeviceRegistration deviceRegistration = new DeviceRegistration
                {
                    RegistrationId = registration.RegistrationId,
                    RegistrationType = registration.GetRegistrationType().Name(),
                    PNSHandle = registration.PNSHandle,
                    Tags = registration.Tags.ToList()
                };

                // subscribe to the SubscriptionTags list with a simple template.
                TemplateRegistration templateReg = hub.RegisterTemplate(registration.PNSHandle, "defaultTemplate", AppConstants.FCMTemplateBody, AppConstants.SubscriptionTags);
                deviceRegistration.RegistrationTemplateId = templateReg.RegistrationId;

                string registrationDevice = JsonConvert.SerializeObject(deviceRegistration);
                Preferences.Set(TextStrings.KeyRegistrationDevice, registrationDevice);
            }
            catch (Exception e)
            {
                Log.Error(AppConstants.DebugTag, $"Error registering device: {e.Message}");
            }
        }

        private void SendLocalNotification(string body)
        {
            Intent intent = new Intent(this, typeof(MainActivity));
            intent.AddFlags(ActivityFlags.ClearTop);
            intent.PutExtra("notification", JsonConvert.SerializeObject(notificationPush));

            int requestCode = new Random().Next();
            PendingIntent pendingIntent = PendingIntent.GetActivity(this, requestCode, intent, PendingIntentFlags.OneShot);

            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, AppConstants.NotificationChannelName)
                .SetContentTitle(notificationPush.Notification.Title)
                .SetSmallIcon(Resource.Drawable.ic_notification)
                .SetContentText(body)
                .SetAutoCancel(true)
                .SetShowWhen(false)
                .SetContentIntent(pendingIntent);

            if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
            {
                notificationBuilder.SetChannelId(AppConstants.NotificationChannelName);
            }

            NotificationManager notificationManager = NotificationManager.FromContext(this);
            notificationManager.Notify(0, notificationBuilder.Build());
        }

        private void SendMessageToMainPage()
        {
            try
            {
                App.AddNotification(notificationPush);
            }
            catch (Exception ex)
            {
                Log.Error(AppConstants.DebugTag, $"Error: {ex.Message}");
            }
        }
    }
}