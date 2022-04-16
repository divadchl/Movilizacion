using System;

using Xamarin.Forms;
using UXDivers.Grial;

namespace Deteccion
{
    public partial class ContactSimpleDetailPage : ContentPage
    {
        public ContactSimpleDetailPage()
        {
            InitializeComponent();
            BindingContext = new ContactSimpleDetailViewModel();
        }

    }
}