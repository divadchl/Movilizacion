using Elecciones.Common.Models;

namespace Movilizacion.ItemViewModels
{
    public class PersonItemViewModel : Person
    {
        #region [ Properties ]
        public string NombreCompleto => $"{Nombre} {Paterno} {Materno}";
        public string Domicilio
        {
            get
            {
                if (Address == null)
                    return $"{Calle} {NoExterior} {NoInterior}, {Colonia}, {Municipio}";
                else
                    return $"{Address?.Direccion} {Address?.NumeroExterior} {Address?.NumeroInterior} {Address?.Colonia} {Address?.Municipio}";
            }
        }

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
        #endregion [ Properties ]
    }
}
