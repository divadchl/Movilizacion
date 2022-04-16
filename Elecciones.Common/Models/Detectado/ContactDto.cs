using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Detectado
{
    public class ContactDto: DetectadoDto
    {
        public Guid IdContacto { get; set; }
        public bool Voto { get; set; }
        public int IdTipoContacto { get; set; }
        public string TipoContacto { get; set; }
    }
}
