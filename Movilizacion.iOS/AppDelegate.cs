using Foundation;
using UIKit;
using Xamarin.Forms;
using FFImageLoading.Forms.Platform;
using CarouselView.FormsPlugin.iOS;
using System;
using FFImageLoading.Svg.Forms;
using UXDivers.Grial;
using WindowsAzure.Messaging;
using UserNotifications;
using Xamarin.Essentials;
using Movilizacion.Helpers;
using Movilizacion.Business;
using System.Diagnostics;
using System.Linq;
using Elecciones.Common.Models;
using Newtonsoft.Json;

namespace Movilizacion.iOS
{
    // The UIApplicationDelegate for the application. This class is responsible for launching the
    // User Interface of the application, as well as listening (and optionally responding) to application events from iOS.
    [Register("AppDelegate")]
    public class AppDelegate : global::Xamarin.Forms.Platform.iOS.FormsApplicationDelegate
    {
        private SBNotificationHub Hub { get; set; }

        public override bool FinishedLaunching(UIApplication uiApplication, NSDictionary launchOptions)
        {
            global::Xamarin.Forms.Forms.Init();

            // This line enables the device to enter sleep mode, it should be false by default
            // but without this explicit assignment it never sleeps with latest Xamarin.Forms.
            // Set it to true if you need to prevent the device to enter sleep mode while displaying the App 
            UIApplication.SharedApplication.IdleTimerDisabled = false;

            var ignore = typeof(SvgCachedImage);
            CachedImageRenderer.Init(); // Initializing FFImageLoading

            CarouselViewRenderer.Init(); // Initializing CarouselView

            Rg.Plugins.Popup.Popup.Init();

            Xamarin.FormsMaps.Init();

            GrialKit.Init(new ThemeColors(), "Movilizacion.iOS.GrialLicense");

#if !DEBUG
            // Reminder to update the project license to production mode before publishing
            if (!UXDivers.Grial.License.IsProductionLicense())
            {
                BeginInvokeOnMainThread(() =>
                {
                    try
                    {
                        var alert = UIAlertController.Create(
                            "Grial UI Kit Reminder",
                            "Before publishing this App remember to change the license file to PRODUCTION MODE so it doesn't expire.",
                            UIAlertControllerStyle.Alert);

                        alert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));

                        var root = UIApplication.SharedApplication.KeyWindow.RootViewController;
                        var controller = root.PresentedViewController ?? root.PresentationController.PresentedViewController;
                        controller.PresentViewController(alert, animated: true, completionHandler: null);
                    }
                    catch
                    {
                    }
                });
            }
#endif

            // Code for starting up the Xamarin Test Cloud Agent
#if ENABLE_TEST_CLOUD
            Xamarin.Calabash.Start();
#endif

            FormsHelper.ForceLoadingAssemblyContainingType<FFImageLoading.Transformations.BlurredTransformation>();

            ReferenceCalendars();

            LoadApplication(new App());
            base.FinishedLaunching(uiApplication, launchOptions);

            RegisterForRemoteNotifications();
            return true;
        }

        #region Force Device Orientation Support
        /// Property used by <see cref="OrientationLockService" /> to force a specific orientation dynamically.
        /// This property can only futher constraint the orientations statically defined in the Info.plist.
        public UIInterfaceOrientationMask EnabledOrientations { get; set; } = UIInterfaceOrientationMask.All;

        public override UIInterfaceOrientationMask GetSupportedInterfaceOrientations(UIApplication application, UIWindow forWindow) => EnabledOrientations;
        #endregion

        private void ReferenceCalendars()
        {
            // When compiling in release, you may need to instantiate the specific
            // calendar so it doesn't get stripped out by the linker. Just uncomment
            // the lines you need according to the localization needs of the app.
            // For instance, in 'ar' cultures UmAlQuraCalendar is required.
            // https://bugzilla.xamarin.com/show_bug.cgi?id=59077

            new System.Globalization.UmAlQuraCalendar();
            // new System.Globalization.ChineseLunisolarCalendar();
            // new System.Globalization.ChineseLunisolarCalendar();
            // new System.Globalization.HebrewCalendar();
            // new System.Globalization.HijriCalendar();
            // new System.Globalization.IdnMapping();
            // new System.Globalization.JapaneseCalendar();
            // new System.Globalization.JapaneseLunisolarCalendar();
            // new System.Globalization.JulianCalendar();
            // new System.Globalization.KoreanCalendar();
            // new System.Globalization.KoreanLunisolarCalendar();
            // new System.Globalization.PersianCalendar();
            // new System.Globalization.TaiwanCalendar();
            // new System.Globalization.TaiwanLunisolarCalendar();
            // new System.Globalization.ThaiBuddhistCalendar();
        }

        private void RegisterForRemoteNotifications()
        {
            // register for remote notifications based on system version
            if (UIDevice.CurrentDevice.CheckSystemVersion(10, 0))
            {
                UNUserNotificationCenter.Current.RequestAuthorization(UNAuthorizationOptions.Alert |
                    UNAuthorizationOptions.Badge |
                    UNAuthorizationOptions.Sound,
                    (granted, error) =>
                    {
                        if (granted)
                            InvokeOnMainThread(UIApplication.SharedApplication.RegisterForRemoteNotifications);
                    });
            }
            else if (UIDevice.CurrentDevice.CheckSystemVersion(8, 0))
            {
                var pushSettings = UIUserNotificationSettings.GetSettingsForTypes(
                UIUserNotificationType.Alert | UIUserNotificationType.Badge | UIUserNotificationType.Sound,
                new NSSet());

                UIApplication.SharedApplication.RegisterUserNotificationSettings(pushSettings);
                UIApplication.SharedApplication.RegisterForRemoteNotifications();
            }
            else
            {
                UIRemoteNotificationType notificationTypes = UIRemoteNotificationType.Alert | UIRemoteNotificationType.Badge | UIRemoteNotificationType.Sound;
                UIApplication.SharedApplication.RegisterForRemoteNotificationTypes(notificationTypes);
            }
        }

        public override void RegisteredForRemoteNotifications(UIApplication application, NSData deviceToken)
        {
            byte[] dt = deviceToken.ToArray();
            string token = BitConverter.ToString(dt).Replace("-", "").ToUpperInvariant();

            var DeviceToken = deviceToken.Description;
            if (!string.IsNullOrWhiteSpace(DeviceToken))
                DeviceToken = DeviceToken.Trim('<').Trim('>');
            
            // Get previous device token
            var oldDeviceToken = NSUserDefaults.StandardUserDefaults.StringForKey("PushDeviceToken");

            // Has the token changed?
            if (string.IsNullOrEmpty(oldDeviceToken) || !oldDeviceToken.Equals(DeviceToken))
            {
                NSUserDefaults.StandardUserDefaults.SetString(DeviceToken, "PushDeviceToken");

                Hub = new SBNotificationHub(AppConstantsMov.ListenConnectionString, AppConstantsMov.NotificationHubName);

                Hub.UnregisterAll(deviceToken, (error) =>
                {
                    if (error != null)
                    {
                        Debug.WriteLine($"Unable to call unregister {error}");
                        return;
                    }

                    NSSet tags = new NSSet(AppConstantsMov.SubscriptionTags.ToArray());
                    Hub.RegisterNative(deviceToken, tags, (errorCallback) =>
                    {
                        if (errorCallback != null)
                            Debug.WriteLine($"RegisterNativeAsync error: {errorCallback}");
                    });
                });
                DeviceRegistration deviceRegistration = new DeviceRegistration
                {
                    PNSHandle = token,
                    Tags = AppConstantsMov.SubscriptionTags.ToList(),
                    RegistrationType = "apns"
                };
                string registrationDevice = JsonConvert.SerializeObject(deviceRegistration);
                Preferences.Set(TextStrings.KeyRegistrationDevice, registrationDevice);
            }
        }

        public override void DidReceiveRemoteNotification(UIApplication application, NSDictionary userInfo, Action<UIBackgroundFetchResult> completionHandler)
        {
            ProcessNotification(userInfo, false);
        }

        void ProcessNotification(NSDictionary options, bool fromFinishedLaunching)
        {
            // make sure we have a payload
            if (options != null && options.ContainsKey(new NSString("aps")))
            {
                NSDictionary aps = options.ObjectForKey(new NSString("aps")) as NSDictionary;
                string payload = string.Empty;
                NSString payloadKey = new NSString("alert");
                if (aps.ContainsKey(payloadKey))
                {
                    payload = aps[payloadKey].ToString();
                    var parameters = aps.ObjectForKey(new NSString("parameters")) as NSDictionary;

                    NotificationPush notificationPush = new NotificationPush
                    {
                        Notification = new Notification
                        {
                            Title = parameters["title"].ToString(),
                            Body = parameters["body"].ToString(),
                            Tag = parameters["tag"].ToString(),
                        },
                        Data = new Data
                        {
                            Id = new Guid(parameters["id"].ToString())
                        }
                    };

                    NSError error;
                    var json = NSJsonSerialization.Serialize(parameters, NSJsonWritingOptions.PrettyPrinted, out error);
                    Newtonsoft.Json.Linq.JObject jObject = Newtonsoft.Json.Linq.JObject.Parse(json.ToString(NSStringEncoding.UTF8));

                    if (!string.IsNullOrWhiteSpace(payload))
                    {
                        var myAlert = UIAlertController.Create("Notification", payload, UIAlertControllerStyle.Alert);
                        myAlert.AddAction(UIAlertAction.Create("OK", UIAlertActionStyle.Default, null));
                        UIApplication.SharedApplication.KeyWindow.RootViewController.PresentViewController(myAlert, true, null);

                        App.AddNotification(notificationPush);
                    }
                }
            }
            else
            {
                Debug.WriteLine($"Received request to process notification but there was no payload.");
            }
        }
    }
}
