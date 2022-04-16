using Elecciones.Common.Models;
using System;

namespace Elecciones.Common.Requests
{
    public class AddressINERequest
    {
        public Guid IdPersona { get; set; }

        public AddressINE Address { get; set; }
    }
}
