using System;
using Rg.Plugins.Popup.Pages;
using Rg.Plugins.Popup.Services;
using UXDivers.Grial;

namespace Deteccion
{
    public partial class SimpleDialog : PopupPage
    {
        public SimpleDialog(string title, string message, string button)
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
