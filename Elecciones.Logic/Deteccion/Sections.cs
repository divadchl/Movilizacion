using Elecciones.Common.Models;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace Elecciones.Logic.Deteccion
{
    public class Sections
    {
        public async Task<Section> GetSection(int section, int state)
        {
            Section sectionObj = null;
            try
            {
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    sectionObj = await db.CATSecciones
                        .Where(x => x.Seccion == section && x.IdEstado == state)
                        .Select(s => new Section
                        {
                            IdSection = s.IdSeccion,
                            IdState = s.IdEstado,
                            IdMunicipality = s.IdMunicipio,
                            IdFederalDistrict = s.IdDistritoFederal,
                            IdLocalDistrict = s.IdDistritoLocal,
                            SectionNum = s.Seccion,
                        })
                        .FirstOrDefaultAsync();
                }
            }
            catch (Exception ex)
            {
                string message = ex.Message;
            }
            return sectionObj;
        }

        public async Task<Section> GetSection(int section)
        {
            Section sectionObj = null;
            try
            {
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    sectionObj = await db.CATSecciones
                        .Where(x => x.Seccion == section)
                        .Select(s => new Section
                        {
                            IdSection = s.IdSeccion,
                            IdState = s.IdEstado,
                            IdMunicipality = s.IdMunicipio,
                            IdFederalDistrict = s.IdDistritoFederal,
                            IdLocalDistrict = s.IdDistritoLocal,
                            SectionNum = s.Seccion,
                        })
                        .FirstOrDefaultAsync();
                }
            }
            catch (Exception ex)
            {
                string message = ex.Message;
            }
            return sectionObj;
        }
    }
}
