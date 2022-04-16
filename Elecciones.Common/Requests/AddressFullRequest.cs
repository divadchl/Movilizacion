using Elecciones.Common.Models;
using System;

namespace Elecciones.Common.Requests
{
    public class AddressFullRequest
    {
        public Guid IdPersona { get; set; }

        public AddressFull Address { get; set; }
    }
}
