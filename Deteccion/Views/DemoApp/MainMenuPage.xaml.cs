using System;
using Xamarin.Forms;
using UXDivers.Grial;
using Xamarin.Essentials;

namespace Deteccion
{
    public partial class MainMenuPage : ContentPage
    {
        public MainMenuPage(Action<Page> openPageAsRoot)
        {
            InitializeComponent();

            BindingContext = new MainMenuViewModel(Navigation, openPageAsRoot);
            lblVersion.Text = $"Ver. {VersionTracking.CurrentVersion}";
        }
    }
}