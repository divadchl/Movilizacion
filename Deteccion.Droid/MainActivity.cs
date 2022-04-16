using Acr.UserDialogs;
using Acr.UserDialogs.Infrastructure;
using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.Gms.Common;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Deteccion.Droid.Services;
using Elecciones.Common.Business;
using Elecciones.Common.Models;
using Java.Util;
using Newtonsoft.Json;
using Plugin.CurrentActivity;
using Plugin.Permissions;
using System;
using UXDivers.Grial;
using Xamarin.Forms.Platform.Android;

namespace Deteccion.Droid
{
#if DEBUG
    [IntentFilter(new[] { Xamarin.Essentials.Platform.Intent.ActionAppAction }, Categories = new[] { Android.Content.Intent.CategoryDefault })] 
#endif
    //https://developer.android.com/guide/topics/manifest/activity-element.html
    [Activity(
        Label = "@string/app_name",
        Icon = "@drawable/icon",
        Theme = "@style/Theme.Splash",
        MainLauncher = true,
        LaunchMode = LaunchMode.SingleTask,
        ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.Locale | ConfigChanges.LayoutDirection
        )
    ]
    public class MainActivity : FormsAppCompatActivity
    {
        private Locale _locale;

        protected override void OnCreate(Bundle savedInstanceState)
        {
            // Changing to App's theme since we are OnCreate and we are ready to 
            // "hide" the splash
            base.Window.RequestFeature(WindowFeatures.ActionBar);
            base.SetTheme(Resource.Style.AppTheme);

            FormsAppCompatActivity.ToolbarResource = Resource.Layout.Toolbar;
            FormsAppCompatActivity.TabLayoutResource = Resource.Layout.Tabbar;

            base.OnCreate(savedInstanceState);

            

            // Initializing FFImageLoading
            FFImageLoading.Forms.Platform.CachedImageRenderer.Init(enableFastRenderer: false);

            global::Xamarin.Forms.Forms.Init(this, savedInstanceState);

            // Initializing Xamarin.Essentials
            Xamarin.Essentials.Platform.Init(this, savedInstanceState);

            CrossCurrentActivity.Current.Init(this, savedInstanceState);

            // Initializing Popups
            Rg.Plugins.Popup.Popup.Init(this);

            // Initializing InputKit
            Plugin.InputKit.Platforms.Droid.Config.Init(this, savedInstanceState);
            
            // Initializing UserDialogs
            UserDialogs.Init(this);

            GrialKit.Init(this, "Deteccion.Droid.GrialLicense");

#if !DEBUG
            // Reminder to update the project license to production mode before publishing
            if (!UXDivers.Grial.License.IsProductionLicense())
            {
                try
                {
                    AlertDialog.Builder alert = new AlertDialog.Builder(this);
                    alert.SetTitle("Grial UI Kit Reminder");
                    alert.SetMessage("Before publishing this App remember to change the license file to PRODUCTION MODE so it doesn't expire.");
                    alert.SetPositiveButton("OK", (sender, e) => { });

                    var dialog = alert.Create();
                    dialog.Show();
                }
                catch
                {
                }
            }
#endif

            _locale = Resources.Configuration.Locale;

            ReferenceCalendars();

#if GORILLA
            LoadApplication(
                UXDivers.Gorilla.Droid.Player.CreateApplication(
                    this,
                    new UXDivers.Gorilla.Config("Good Gorilla")
                        // Grial Core
                        .RegisterAssemblyFromType<UXDivers.Grial.NegateBooleanConverter>()

                        // FFImageLoading.Forms
                        .RegisterAssemblyFromType<FFImageLoading.Forms.CachedImage>()
                        // FFImageLoading.Transformations
                        .RegisterAssemblyFromType<FFImageLoading.Transformations.BlurredTransformation>()
                        // FFImageLoading.Svg.Forms
                        .RegisterAssemblyFromType<FFImageLoading.Svg.Forms.SvgCachedImage>()


                        // Grial Application .Net Standard
                        .RegisterAssembly(typeof(Deteccion.App).Assembly)

            			.RegisterAssembly(typeof(CarouselViewRenderer).Assembly)
            			.RegisterAssembly(typeof(CarouselView.FormsPlugin.Abstractions.CarouselViewControl).Assembly)

                        .RegisterAssembly(typeof(Rg.Plugins.Popup.Pages.PopupPage).Assembly)

                        .RegisterAssembly(typeof(Xamanimation.AnimationBase).Assembly)
                        .RegisterAssembly(typeof(AnimatedBaseBehavior).Assembly)
                    ));
#else

            LoadApplication(new App());
            if (!IsPlayServiceAvailable())
            {
                throw new Exception("This device does not have Google Play Services and cannot receive push notifications.");
            }

            CreateNotificationChannel();

#endif
        }

        public override void OnConfigurationChanged(Android.Content.Res.Configuration newConfig)
        {
            base.OnConfigurationChanged(newConfig);

            GrialKit.NotifyConfigurationChanged(newConfig);
        }

        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Permission[] grantResults)
        {
            Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);
            ContactsService.OnRequestPermissionsResult(requestCode, permissions, grantResults);
            PermissionsImplementation.Current.OnRequestPermissionsResult(requestCode, permissions, grantResults);
            base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }

#if GORILLA
        public override bool OnKeyUp (Android.Views.Keycode keyCode, Android.Views.KeyEvent e)  
        {  
            if ((keyCode == Android.Views.Keycode.F1 || keyCode == Android.Views.Keycode.Menu || keyCode == Android.Views.Keycode.VolumeUp || keyCode == Android.Views.Keycode.VolumeDown || keyCode == Android.Views.Keycode.VolumeMute) && UXDivers.Gorilla.Coordinator.Instance != null) {  
                UXDivers.Gorilla.ActionManager.ShowMenu();
                return true; 
            } 

            return base.OnKeyUp (keyCode, e); 
        }

        private readonly static GestureDetector LongPressDetector = new GestureDetector (new UXDivers.Gorilla.Droid.LongPressGestureListener());

        public override bool DispatchTouchEvent(MotionEvent ev)
        {
            LongPressDetector.OnTouchEvent(ev);
                             
            return base.DispatchTouchEvent(ev);
        }
#endif

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

        private bool IsPlayServiceAvailable()
        {
            int resultCode = GoogleApiAvailability.Instance.IsGooglePlayServicesAvailable(this);
            if (resultCode != ConnectionResult.Success)
            {
                if (GoogleApiAvailability.Instance.IsUserResolvableError(resultCode))
                {
                    Log.Debug(AppConstants.DebugTag, GoogleApiAvailability.Instance.GetErrorString(resultCode));
                }
                else
                {
                    Log.Debug(AppConstants.DebugTag, "This device is not supported");
                }
                return false;
            }
            return true;
        }

        private void CreateNotificationChannel()
        {
            // Notification channels are new as of "Oreo".
            // There is no need to create a notification channel on older versions of Android.
            if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
            {
                string channelName = AppConstants.NotificationChannelName;
                string channelDescription = string.Empty;
                NotificationChannel channel = new NotificationChannel(channelName, channelName, NotificationImportance.Default)
                {
                    Description = channelDescription
                };

                NotificationManager notificationManager = (NotificationManager)GetSystemService(NotificationService);
                notificationManager.CreateNotificationChannel(channel);
            }
        }

        protected override async void OnNewIntent(Intent intent)
        {
            if (intent.Extras != null)
            {
                try
                {
                    NotificationPush notification = JsonConvert.DeserializeObject<NotificationPush>(intent.GetStringExtra("notification"));
                    await App.GoNotifications(notification);
                }
                catch (Exception ex)
                {
                    Log.Debug(AppConstants.DebugTag, ex.Message);
                }
            }
#if DEBUG
            Xamarin.Essentials.Platform.OnNewIntent(intent); 
#endif
            base.OnNewIntent(intent);
        }

#if DEBUG
        protected override void OnResume()
        {
            base.OnResume();

            Xamarin.Essentials.Platform.OnResume(this);
        } 
#endif
    }
}

