//------------------------------------------------------------------------------
// <auto-generated>
//     Este código fue generado por una herramienta.
//     Versión de runtime:4.0.30319.42000
//
//     Los cambios en este archivo podrían causar un comportamiento incorrecto y se perderán si
//     se vuelve a generar el código.
// </auto-generated>
//------------------------------------------------------------------------------

[assembly: global::Xamarin.Forms.Xaml.XamlResourceIdAttribute("Deteccion.Views.Forms.SignUpPage.xaml", "Views/Forms/SignUpPage.xaml", typeof(global::Deteccion.SignUpPage))]

namespace Deteccion {
    
    
    [global::Xamarin.Forms.Xaml.XamlFilePathAttribute("Views\\Forms\\SignUpPage.xaml")]
    public partial class SignUpPage : global::Xamarin.Forms.ContentPage {
        
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Xamarin.Forms.Build.Tasks.XamlG", "2.0.0.0")]
        private global::UXDivers.Grial.EmailValidatorBehavior emailValidator;
        
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Xamarin.Forms.Build.Tasks.XamlG", "2.0.0.0")]
        private void InitializeComponent() {
            global::Xamarin.Forms.Xaml.Extensions.LoadFromXaml(this, typeof(SignUpPage));
            emailValidator = global::Xamarin.Forms.NameScopeExtensions.FindByName<global::UXDivers.Grial.EmailValidatorBehavior>(this, "emailValidator");
        }
    }
}