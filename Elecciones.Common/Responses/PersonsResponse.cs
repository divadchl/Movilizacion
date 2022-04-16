using Elecciones.Common.Models;
using System.Collections.Generic;

namespace Elecciones.Common.Responses
{
    public class PersonsResponse
    {
        public List<Person> Persons { get; set; }
        public List<Stall> Stalls { get; set; }
    }
}
