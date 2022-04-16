using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elecciones.Models.Models
{
    public class ResultViewModel
    {
        public Guid Id { get; set; }
        public bool Success { get { return !Errors.Any(); } }
        public string Message { get; set; }
        public List<string> Errors { get; set; }

        public ResultViewModel()
        {
            Errors = new List<string>();
        }
    }
}
