using System;
using System.Collections.Generic;
using System.Globalization;
using Xamarin.Forms;
using UXDivers.Grial;
using Movilizacion.Views.ChatFlow;
using Movilizacion.Views.Navigation.Lists;
using Movilizacion.Views.Forms;
using Movilizacion.Views.Articles;
using Movilizacion.Views.TasksFlow;
using Movilizacion.Views.Maps;
using Movilizacion.Views.Social;
using Elecciones.Common.Responses;
using Newtonsoft.Json;
using Xamarin.Essentials;
using Movilizacion.Helpers;
using Movilizacion.Views.Messages;
using Movilizacion.Views.Navigation.Tabs;

namespace Movilizacion
{
    public class MainMenuViewModel : ObservableObject
    {
        private string _process;
        private readonly INavigation _navigation;
        private readonly Action<Page> _openPageAsRoot;
        private List<MenuEntry> _mainMenuEntries;
        private MenuEntry _selectedMainMenuEntry;

        public MainMenuViewModel(INavigation navigation, Action<Page> openPageAsRoot)
            : base(listenCultureChanges: true)
        {
            _navigation = navigation;
            _openPageAsRoot = openPageAsRoot;

            LoadData();

            UserMovResponse user = JsonConvert.DeserializeObject<UserMovResponse>(Preferences.Get(TextStrings.KeyUser, string.Empty));
            Process = user.Process.Name;

            var firstEntry = _mainMenuEntries[0];
            if (firstEntry.IsModal)
            {
                openPageAsRoot(new NavigationPage(CreateDetailDefaultBackgroundPage()));
            }
            else
            {
                MainMenuSelectedItem = firstEntry;
            }
        }

        public string Process 
        { 
            get => _process;
            set => SetProperty(ref _process, value);
        }

        public List<MenuEntry> MainMenuEntries
        {
            get { return _mainMenuEntries; }
            set { SetProperty(ref _mainMenuEntries, value); }
        }

        public MenuEntry MainMenuSelectedItem
        {
            get { return _selectedMainMenuEntry; }
            set 
            { 
                if (SetProperty(ref _selectedMainMenuEntry, value) && value != null)
                {
                    Page page;

                    if (value.PageType != null)
                    {
                        page = CreatePage(value.PageType);
                    }
                    else
                    {
                        page = value.CreatePage();
                    }

                    NavigationPage navigationPage;

                    if (value.NavigationPageType == null)
                    {
                        navigationPage = new NavigationPage(page);
                    }
                    else
                    {
                        navigationPage = (NavigationPage)Activator.CreateInstance(value.NavigationPageType, page);
                    }

                    if (value.UseTransparentNavBar)
                    {
                        GrialNavigationPage.SetIsBarTransparent(navigationPage, true);
                    }

                    if (_selectedMainMenuEntry.IsModal)
                    {
                        _navigation.PushModalAsync(navigationPage);
                    }
                    else
                    {
                        _openPageAsRoot(navigationPage);
                    }

                    _selectedMainMenuEntry = null;
                    NotifyPropertyChanged(nameof(MainMenuSelectedItem));
                }
            }
        }

        protected override void OnCultureChanged(CultureInfo culture)
        {
            LoadData();
        }

        private static ContentPage CreateDetailDefaultBackgroundPage()
        {
            var content = new Grid();
            var logo = new Label
            {
                Text = GrialIconsFont.LogoGrial,
                FontSize = 100,
                VerticalOptions = LayoutOptions.Center,
                HorizontalOptions = LayoutOptions.Center,
                Style = (Style)Application.Current.Resources["FontIcon"]
            };
            logo.SetDynamicResource(Label.TextColorProperty, "ComplementColor");
            content.Children.Add(logo);
            return new ContentPage { Content = content };
        }

        private void LoadData()
        {
            MainMenuEntries = new List<MenuEntry>
            {
                new MenuEntry { Name = Resx.AppResources.PageTilteGraphics, Icon = GrialIconsFont.BarChart2, PageType = typeof(GraphicsPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleChatMain, Icon = GrialIconsFont.AccountCircle, PageType = typeof(PersonsTabbedPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleStalls, Icon = GrialIconsFont.Box, PageType = typeof(StallsTabbedPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleGuests, Icon = GrialIconsFont.Users, PageType = typeof(GuestTabPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleArticlesClassicView, Icon = GrialIconsFont.BookOpen, PageType = typeof(NewsPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleEncuestas, Icon = GrialIconsFont.FilePlus, PageType = typeof(PollsListPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleNotifications2, Icon = GrialIconsFont.Bell, PageType = typeof(NotificationsListPage), IsModal = false },
                new MenuEntry { Name = Resx.AppResources.PageTitleProfile, Icon = GrialIconsFont.User, PageType = typeof(ProfilePage), IsModal = false },
            };
        }

        private Page CreatePage(Type pageType)
        {
            return Activator.CreateInstance(pageType) as Page;
        }

        public class MenuEntry
        {
            public string Name { get; set; }
            public string Icon { get; set; }
            public bool UseTransparentNavBar { get; set; }
            public Type PageType { get; set; }
            public Func<Page> CreatePage { get; set; }
            public Type NavigationPageType { get; set; }
            public bool IsModal { get; set; }
        }
    }
}