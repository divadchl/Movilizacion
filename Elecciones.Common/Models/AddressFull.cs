namespace Elecciones.Common.Models
{
    public class AddressFull : AddressINE
    {
        public string Colony { get; set; }
        public int State { get; set; }
        public string CP { get; set; }
        public int Municipality { get; set; }
    }
}
