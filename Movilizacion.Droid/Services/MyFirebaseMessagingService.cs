using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Android.Util;
using Firebase.Messaging;
using Android.Support.V4.App;
using WindowsAzure.Messaging;
using Movilizacion.Business;
using Elecciones.Common.Models;
using Movilizacion.Helpers;
using Xamarin.Essentials;
using Newtonsoft.Json;

namespace Movilizacion.Droid.Services
{
    [Service]
    [IntentFilter(new[] { "com.google.firebase.MESSAGING_EVENT" })]
    [IntentFilter(new[] { "com.google.firebase.INSTANCE_ID_EVENT" })]
    public class MyFirebaseMessagingService : FirebaseMessagingService
    {
        NotificationPush notificationPush = new NotificationPush();

        public override void OnMessageReceived(RemoteMessage message)
        {
            if (message.GetNotification() != null)
            {
                notificationPush.Notification.Body = message.GetNotification().Body;
                notificationPush.Notification.Title = message.GetNotification().Title;
                notificationPush.Notification.Tag = message.GetNotification().Tag;
                IDictionary<string, string> data = message.Data;
                foreach (var item in data)
                    notificationPush.Data.Id = new Guid(item.Value);

                SendNotification(message.GetNotification().Body);
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
                SendNotification(notificationPush.Notification.Body);
            }

            // send the incoming message directly to the MainPage
            SendMessageToMainPage();
        }

        public override void OnNewToken(string token)
        {
            // TODO: save token instance locally, or log if desired
            SendRegistrationToServer(token);
        }

        void SendRegistrationToServer(string token)
        {
            try
            {
                // Register with Notification Hubs
                NotificationHub hub = new NotificationHub(AppConstantsMov.NotificationHubName, AppConstantsMov.ListenConnectionString, this);

                Registration registration = hub.Register(token, AppConstantsMov.SubscriptionTags);
                DeviceRegistration deviceRegistration = new DeviceRegistration
                {
                    RegistrationId = registration.RegistrationId,
                    RegistrationType = registration.GetRegistrationType().Name(),
                    PNSHandle = registration.PNSHandle,
                    Tags = registration.Tags.ToList()
                };

                // subscribe to the SubscriptionTags list with a simple template.
                TemplateRegistration templateReg = hub.RegisterTemplate(registration.PNSHandle, "defaultTemplate", AppConstantsMov.FCMTemplateBody, AppConstantsMov.SubscriptionTags);
                deviceRegistration.RegistrationTemplateId = templateReg.RegistrationId;

                string registrationDevice = JsonConvert.SerializeObject(deviceRegistration);
                Preferences.Set(TextStrings.KeyRegistrationDevice, registrationDevice);
            }
            catch (Exception e)
            {
                Log.Error(AppConstantsMov.DebugTag, $"Error registering device: {e.Message}");
            }
        }

        void SendNotification(string messageBody)
        {
            Intent intent = new Intent(this, typeof(MainActivity));
            intent.AddFlags(ActivityFlags.ClearTop);
            PendingIntent pendingIntent = PendingIntent.GetActivity(this, 0, intent, PendingIntentFlags.OneShot);

            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, AppConstantsMov.NotificationChannelName)
                .SetContentTitle(notificationPush.Notification.Title)
                .SetSmallIcon(Resource.Drawable.ic_notification)
                .SetContentText(messageBody)
                .SetAutoCancel(true)
                .SetShowWhen(false)
                .SetContentIntent(pendingIntent);

            if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
            {
                notificationBuilder.SetChannelId(AppConstantsMov.NotificationChannelName);
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
                Log.Error(AppConstantsMov.DebugTag, $"Error: {ex.Message}");
            }
        }
    }
}