using Movilizacion.ItemViewModels;
using Movilizacion.ViewModels.Popups;
using Rg.Plugins.Popup.Pages;
using Rg.Plugins.Popup.Services;
using System;
using Xamarin.Forms.Xaml;

namespace Movilizacion.Controls.Popups
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class StatusDialogPage : PopupPage
    {
        public StatusDialogPage(StallItemViewModel stall)
        {
            InitializeComponent();
            BindingContext = new StatusDialogViewModel(stall);
        }

        private void OnClose(object sender, EventArgs e)
        {
            PopupNavigation.Instance.PopAsync();
        }
    }
}