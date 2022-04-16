using System.Collections.Generic;
using Xamarin.Forms.Maps;

namespace Movilizacion.Renders
{
    public class CustomMap : Map
    {
        public List<CustomPin> CustomPins { get; set; } = new List<CustomPin>();
    }
}
