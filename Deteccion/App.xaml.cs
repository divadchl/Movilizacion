using Deteccion.Helpers;
using Deteccion.ViewModels.Messages;
using Deteccion.Views.Forms;
using Deteccion.Views.Messages;
using Deteccion.Views.Navigation.Lists;
using Deteccion.Views.Onboarding;
using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Microsoft.AppCenter.Analytics;
using Microsoft.AppCenter.Crashes;
using Newtonsoft.Json;
using Rg.Plugins.Popup.Services;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Xamarin.Essentials;
using Xamarin.Forms;

namespace Deteccion
{
    public partial class App : Application
    {
        private static NotificationRepository _notificationRepository;


        public static NotificationRepository NotificationRepository
        {
            get 
            { 
                if(_notificationRepository == null)
                    _notificationRepository = new NotificationRepository();
                return _notificationRepository; 
            }
        }

        public App()
        {
            Device.SetFlags(new string[] { "RadioButton_Experimental", "SwipeView_Experimental" });
            VersionTracking.Track();

#if DEBUG
            AppActions.OnAppAction += AppActions_OnAppAction; 
#endif

            InitializeComponent();

            Microsoft.AppCenter.AppCenter.Start("android=18a6e3b4-dcbc-4385-bcce-1c8193042f69;" +
                  "ios={Your iOS App secret here}",
                  typeof(Analytics), typeof(Crashes));

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
            //    xmlns:resx="clr-namespace:Deteccion"
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

#if DEBUG
        private void AppActions_OnAppAction(object sender, AppActionEventArgs e)
        {
            // Don't handle events fired for old application instances
            // and cleanup the old instance's event handler
            if (Application.Current != this && Application.Current is App app)
            {
                AppActions.OnAppAction -= app.AppActions_OnAppAction;
                return;
            }

            MainThread.BeginInvokeOnMainThread(() =>
            {
                // Add all the ID option availablez
                switch (e.AppAction.Id)
                {
                    case "ChangeCIC":
                        MainPage = new NavigationPage(new ResendCICPage("1"));
                        break;
                    case "VotePerson":
                        MainPage = new NavigationPage(new VotePage());
                        break;
                    default:
                        MainPage = new NavigationPage(new RootMasterDetailPage());
                        break;
                }
            });
        } 
#endif

        public static Page GetMainPage()
        {
            //return new NavigationPage(new ConfirmDataChangePage());

            if (Settings.IsLogin)
            {
                //return new NavigationPage(new WalkthroughMinimalPage(false));
                //return new NavigationPage(new ConfirmDataChangePage());
                //return new NavigationPage(new Views.Messages.InvitationsListPage());

                return new NavigationPage(new RootMasterDetailPage());
            }
            else
            {
                return new NavigationPage(new LoginPage());
            }

        }

        public static void AddNotification(NotificationPush notificationPush)
        {
            GetDataNotification getDataNotification = new GetDataNotification();
            Models.Notification notification = new Models.Notification();
            
            Device.BeginInvokeOnMainThread(async () =>
            {
                notification.DateNotification = DateTime.Now;
                if (notificationPush.Notification.Tag.Equals(TextStrings.Poll))
                {
                    Responses.PollResponse poll = await getDataNotification.LoadPollAsync(notificationPush.Data.Id);
                    if (poll == null)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, "No se guardó la notificación", TextStrings.Accept));
                        return;
                    }

                    notification.Icon = "ic_poll";
                    notification.Title = poll.Poll;
                    notification.Description = $"Cierra el {poll.Validity:dd/MMM/yyyy}";
                    notification.TypeNotification = (int)TypeNotification.Poll;
                    notification.SerializeObject = JsonConvert.SerializeObject(poll);
                }
                else if (notificationPush.Notification.Tag.Equals(TextStrings.News))
                {
                    var newsItem = await getDataNotification.LoadNewsAsync(notificationPush.Data.Id);
                    if (newsItem == null)
                    {
                        await PopupNavigation.Instance.PushAsync(new SimpleDialog(TextStrings.Error, "No se guardó la notificación", TextStrings.Accept));
                        return;
                    }

                    notification.Icon = "ic_news";
                    notification.Title = newsItem.Title;
                    notification.Description = newsItem.Description;
                    notification.TypeNotification = (int)TypeNotification.News;
                    notification.SerializeObject = JsonConvert.SerializeObject(newsItem);
                }
                else if (notificationPush.Notification.Tag.Equals(TextStrings.Notice))
                {
                    notification.Icon = "ic_notice";
                    notification.Title = notificationPush.Notification.Title;
                    notification.Description = notificationPush.Notification.Body;
                    notification.TypeNotification = (int)TypeNotification.Notice;
                    notification.SerializeObject = string.Empty;
                }
                else if (notificationPush.Notification.Tag.Equals(TextStrings.TagNoticeVote))
                {
                    notification.Icon = "ic_notice";
                    notification.Title = notificationPush.Notification.Title;
                    notification.Description = notificationPush.Notification.Body;
                    notification.TypeNotification = (int)TypeNotification.NoticeVote;
                    notification.SerializeObject = string.Empty;
                }
                else if (notificationPush.Notification.Tag.Equals(TextStrings.TagValidationCredential))
                {
                    notification.Icon = "ic_notice";
                    notification.Title = notificationPush.Notification.Title;
                    notification.Description = notificationPush.Notification.Body;
                    notification.TypeNotification = (int)TypeNotification.ValidationCredential;
                    notification.SerializeObject = notificationPush.Data.Value;
                }
                else
                {
                    return;
                }

                App.NotificationRepository.AddOrUpdate(notification);
                NotificationsListViewModel.Instance().LoadNotifications();
            });
        }

        public static async Task GoNotifications(NotificationPush notificationPush)
        {
            if (Settings.IsLogin)
                if (notificationPush.Notification.Tag.Equals(TextStrings.Poll))
                    await App.Current.MainPage.Navigation.PushAsync(new PollsListPage());
                else if (notificationPush.Notification.Tag.Equals(TextStrings.News))
                    await App.Current.MainPage.Navigation.PushAsync(new ArticlesClassicViewPage());
                else if (notificationPush.Notification.Tag.Equals(TextStrings.Notice))
                    await App.Current.MainPage.Navigation.PushAsync(new NotificationsListPage());
                else if (notificationPush.Notification.Tag.Equals(TextStrings.TagNoticeVote))
                    await App.Current.MainPage.Navigation.PushAsync(new VotePage());
                else if (notificationPush.Notification.Tag.Equals(TextStrings.TagValidationCredential))
                    await App.Current.MainPage.Navigation.PushAsync(new ResendCICPage(notificationPush.Data.Value));
                else
                    return;
        }

#if DEBUG
        protected override async void OnStart()
        {
            try
            {
                await AppActions.SetAsync(
                    new AppAction("ChangeCIC", "CIC", icon: "icon"),
                    new AppAction("VotePerson", "Votar", icon: "icon"));
            }
            catch (Exception)
            {
                Debug.WriteLine("App Actions not supported");
            }
        } 
#endif
    }
}
