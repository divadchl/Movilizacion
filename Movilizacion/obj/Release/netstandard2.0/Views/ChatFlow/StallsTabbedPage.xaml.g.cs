//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

[assembly: global::Xamarin.Forms.Xaml.XamlResourceIdAttribute("Movilizacion.Views.ChatFlow.StallsTabbedPage.xaml", "Views/ChatFlow/StallsTabbedPage.xaml", typeof(global::Movilizacion.Views.ChatFlow.StallsTabbedPage))]

namespace Movilizacion.Views.ChatFlow {
    
    
    [global::Xamarin.Forms.Xaml.XamlFilePathAttribute("Views\\ChatFlow\\StallsTabbedPage.xaml")]
    public partial class StallsTabbedPage : global::Xamarin.Forms.ContentPage {
        
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Xamarin.Forms.Build.Tasks.XamlG", "2.0.0.0")]
        private global::Xamarin.Forms.ListView lstStalls;
        
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Xamarin.Forms.Build.Tasks.XamlG", "2.0.0.0")]
        private global::Movilizacion.Renders.CustomMap MyMap;
        
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Xamarin.Forms.Build.Tasks.XamlG", "2.0.0.0")]
        private void InitializeComponent() {
            global::Xamarin.Forms.Xaml.Extensions.LoadFromXaml(this, typeof(StallsTabbedPage));
            lstStalls = global::Xamarin.Forms.NameScopeExtensions.FindByName<global::Xamarin.Forms.ListView>(this, "lstStalls");
            MyMap = global::Xamarin.Forms.NameScopeExtensions.FindByName<global::Movilizacion.Renders.CustomMap>(this, "MyMap");
        }
    }
}
