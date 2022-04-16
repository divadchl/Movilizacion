using System;
using System.Collections.Generic;

using Xamarin.Forms;
using UXDivers.Grial;

namespace Movilizacion
{
    public partial class NavigationCardsDescriptionListPage : ContentPage
    {
        public NavigationCardsDescriptionListPage()
        {
            InitializeComponent();

            BindingContext = new NavigationViewModel(variantPageName: $"{GetType().Name}.xaml");
        }
    }
}
