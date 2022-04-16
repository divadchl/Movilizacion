using Deteccion.ViewModels.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Messages
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class NotificationsListPage : ContentPage
    {
        public NotificationsListPage()
        {
            InitializeComponent();
            BindingContext = new NotificationsListViewModel();
        }
    }
}