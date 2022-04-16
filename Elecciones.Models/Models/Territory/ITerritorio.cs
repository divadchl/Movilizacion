using System;
using System.Collections.Generic;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    public interface ITerritorio
    {
        int Id { get; }
        string Descripcion { get; }
        string Firma { get; }
        string Value { get; }
    }
}
