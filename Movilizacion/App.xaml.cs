using Xamarin.Forms;
using UXDivers.Grial;
using Movilizacion.Class;
using Movilizacion.Views.Navigation.Lists;
using Movilizacion.ItemViewModels;
using System.Collections.Generic;
using Microsoft.AppCenter.Analytics;
using Microsoft.AppCenter.Crashes;
using Elecciones.Common.Responses;
using Movilizacion.Helpers;
using Elecciones.Common.Models;
using System;
using Elecciones.Common.Enums;
using Movilizacion.ViewModels.Messages;
using Xamarin.Essentials;
using Movilizacion.Views.Messages;
using Newtonsoft.Json;

namespace Movilizacion
{
    public partial class App : Application
    {
        private static NotificationRepository _notificationRepository;
        public static UserMovResponse User { get; set; }

        public static NotificationRepository NotificationRepository
        {
            get
            {
                if (_notificationRepository == null)
                    _notificationRepository = new NotificationRepository();
                return _notificationRepository;
            }
        }

        public App()
        {
            Device.SetFlags(new string[] { "SwipeView_Experimental" });
            InitializeComponent();

            Microsoft.AppCenter.AppCenter.Start("64b54dd6-a5dd-4d15-b240-5a3f0380450b",
                   typeof(Analytics), typeof(Crashes));
            new NetworkState().iHaveInternet();


            // Localization:
            //
            // Use "DefaultStringResources" key to define the default Resx type and get
            // the most compact version of the Translation Xaml extension like this:
            //
            // <Label Text="{ grial:Translate MyStringKey }" />
            //
            // Optionally:
            // <Label Text="{ grial:Translate Key=MyStringKey }" />
            //
            // To use another named Resx you can use either:
            // 
            // a) define the namspace of the Resx type, for instance:
            //    xmlns:resx="clr-namespace:Movilizacion"
            //
            //    and use it like this:
            //    <Label Text="{ grial:Translate Key=resx:OtherResources.MyStringKey }" />
            //
            //  b) define a StaticResource as an instance of the Resx type
            //     <resx:OtherResources x:Key="MyOtherResourcesKey" />
            //
            //     and use it like this:
            //     <Label Text="{ grial:Translate Key=MyStringKey, Source={ StaticResource MyOtherResourcesKey } }" />
            //
            // Note: The Extension supports both Converter and StringFormat properties
            // as regular Bindings do. 
            Resources["DefaultStringResources"] = new Resx.AppResources();


            MainPage = GetMainPage();


        }

        public static Page GetMainPage()
        {
            if (Preferences.Get(TextStrings.KeyIsLogin, false))
            {
                App.User = JsonConvert.DeserializeObject<UserMovResponse>(Preferences.Get(TextStrings.KeyUser, string.Empty));
                return new NavigationPage(new RootMasterDetailPage());
            }
            else
            {
                //return new NavigationPage(new RootMasterDetailPage());
                //return new NavigationPage(new PollsListPage());
                return new NavigationPage(new LoginPage());
            }
        }

        public static void AddNotification(NotificationPush notificationPush)
        {
            Models.Notification notification = new Models.Notification();

            Device.BeginInvokeOnMainThread(() =>
            {
                notification.DateNotification = DateTime.Now;
                if (notificationPush.Notification.Tag.Equals(TextStrings.Notice))
                {
                    notification.Icon = "ic_notice";
                    notification.Title = notificationPush.Notification.Title;
                    notification.Description = notificationPush.Notification.Body;
                    notification.TypeNotification = (int)TypeNotification.Notice;
                    notification.SerializeObject = string.Empty;
                    App.NotificationRepository.AddOrUpdate(notification);
                    NotificationsListViewModel.Instance().LoadNotifications();
                }
            });
        }

        public static void GoNotifications()
        {
            if (!Preferences.Get(TextStrings.KeyIsLogin, false))
                App.Current.MainPage.Navigation.PushAsync(new LoginPage());
            else
                App.Current.MainPage.Navigation.PushAsync(new RootMasterDetailPage());
        }
    }
}
