using Deteccion.ViewModels.Theme;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Deteccion.Views.Theme
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class NoticePrivacyPage : ContentPage
    {
        public NoticePrivacyPage()
        {
            InitializeComponent();
            BindingContext = new NoticePrivacyViewModel();
        }
    }
}