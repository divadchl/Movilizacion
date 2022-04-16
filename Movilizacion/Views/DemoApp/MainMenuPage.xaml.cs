using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Xamarin.Essentials;

namespace Movilizacion
{
    public partial class MainMenuPage : ContentPage
    {
        public MainMenuPage(Action<Page> openPageAsRoot)
        {
            InitializeComponent();
            NavigationPage.SetHasNavigationBar(this, false);

            BindingContext = new MainMenuViewModel(Navigation, openPageAsRoot);
            lblVersion.Text = $"Ver. {VersionTracking.CurrentVersion}";
        }
    }
}