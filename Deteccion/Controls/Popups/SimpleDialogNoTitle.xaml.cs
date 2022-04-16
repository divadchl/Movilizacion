using System;
using System.Collections.Generic;
using Rg.Plugins.Popup.Pages;
using Rg.Plugins.Popup.Services;
using Xamarin.Forms;
using UXDivers.Grial;

namespace Deteccion
{
    public partial class SimpleDialogNoTitleInverse : PopupPage
    {
        public SimpleDialogNoTitleInverse(string title, string message, string button)
        {
            InitializeComponent();
            lblTitle.Text = title;
            lblMessage.Text = message;
            btnText.Text = button;
        }

        private void OnClose(object sender, EventArgs e)
        {
            PopupNavigation.Instance.PopAsync();
        }
    }
}
