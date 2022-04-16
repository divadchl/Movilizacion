namespace Elecciones.Common.Models.Poll
{
    using Elecciones.Common.Models.Territory;
    using System;
    using System.Collections.Generic;

    public class PollDto
    {
        public Guid Identifier { get; set; }
        public string Nombre { get; set; }
        public StateDto Estado { get; set; }
        public MunicipalityDto Municipio { get; set; }
        public FederalDistrictDto DistritoFederal { get; set; }
        public LocalDistrictDto DistritoLocal { get; set; }
        public List<QuestionDto> Preguntas { get; set; }
        public int CantidadPreguntas { get; set; }
        public int CantidadParticipantes { get; set; }
        public string VigenciaStr => Vigencia.ToString("dd/MM/yyyy");
        public DateTime Vigencia { get; set; }
        public bool? Activo { get; set; }
    }
}
