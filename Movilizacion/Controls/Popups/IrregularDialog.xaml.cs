using Movilizacion.ItemViewModels;
using Movilizacion.ViewModels.Popups;
using Rg.Plugins.Popup.Pages;
using Rg.Plugins.Popup.Services;
using System;

namespace Movilizacion
{
    public partial class IrregularDialog : PopupPage
    {
        public IrregularDialog(PersonItemViewModel person)
        {
            InitializeComponent();
            BindingContext = new IrregularDialogViewModel(person);
        }

        private void OnClose(object sender, EventArgs e)
        {
            PopupNavigation.Instance.PopAsync();
        }
    }
}
