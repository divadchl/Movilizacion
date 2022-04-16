using Elecciones.Common.Enums;
using System.Windows.Input;
using Xamarin.Forms;

namespace Deteccion.Models
{
    public class TypeCredentials
    {
        public int Id { get; set; }
        public string ImageFront { get; set; }
        public string ImageBack { get; set; }
        public bool IsVisibleLeft { get; set; }
        public bool IsVisibleRight { get; set; }
        public TypeCredential TypeCredential { get; set; }
    }
}
