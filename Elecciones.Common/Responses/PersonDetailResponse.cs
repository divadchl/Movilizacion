using Elecciones.Common.Models;

namespace Elecciones.Common.Responses
{
    public class PersonDetailResponse : Person
    {
        public string Telefono { get; set; }
        public string Correo { get; set; }
        public string ClaveINE { get; set; }
        public string NoEstado { get; set; }
        public string NoMunicipio { get; set; }
        public string Seccion { get; set; }
        public byte[] Documento { get; set; }

        private string _color;

        public string Color
        {
            get
            {
                switch (Contact?.IdTipoContacto)
                {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        _color = "Azul";
                        _codeColor = "#37ACDB";
                        break;
                    case 7:
                        _color = "Rojo";
                        _codeColor = "#F2090E";
                        break;
                    case 8:
                        _color = "Verde";
                        _codeColor = "#1B943F";
                        break;
                    default:
                        break;
                }
                return _color;
            }
        }
        private string _codeColor;
        public string CodeColor => _codeColor;
    }
}
