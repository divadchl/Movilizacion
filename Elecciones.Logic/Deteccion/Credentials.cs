using Elecciones.Common.Enums;
using Elecciones.Common.Requests;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Elecciones.Logic.Deteccion
{
    public class Credentials
    {

        public async Task SaveImages(DBDeteccionEntities db, CredentialRequest credentialRequest)
        {
            try
            {
                DATDoctoPersona doctoPersona = new DATDoctoPersona
                {
                    IdDoctoPersona = Guid.NewGuid(),
                    IdPersona = credentialRequest.IdPersona,
                    IdTipoDocumento = (int)TypeDocument.ine_frente,
                    Documento = credentialRequest.ImageFront,
                    FechaRegistro = DateTime.Now,
                    Nombre = $"{TypeDocument.ine_frente}_{credentialRequest.IdPersona}.jpg"
                };

                db.DATDoctoPersona.Add(doctoPersona);
                await db.SaveChangesAsync();

                doctoPersona = new DATDoctoPersona
                {
                    IdDoctoPersona = Guid.NewGuid(),
                    IdPersona = credentialRequest.IdPersona,
                    IdTipoDocumento = (int)TypeDocument.ine_atras,
                    Documento = credentialRequest.ImageBack,
                    FechaRegistro = DateTime.Now,
                    Nombre = $"{TypeDocument.ine_frente}_{credentialRequest.IdPersona}.jpg"
                };

                db.DATDoctoPersona.Add(doctoPersona);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                throw new Exception(ex.Message);
            }
        }

        public async Task UpdateImages(DBDeteccionEntities db, CredentialRequest credentialRequest)
        {
            try
            {
                db.DATDoctoPersona.RemoveRange(db.DATDoctoPersona.Where(dp => dp.IdPersona == credentialRequest.IdPersona).ToList());
                await db.SaveChangesAsync();

                DATDoctoPersona doctoPersona = new DATDoctoPersona
                {
                    IdDoctoPersona = Guid.NewGuid(),
                    IdPersona = credentialRequest.IdPersona,
                    IdTipoDocumento = (int)TypeDocument.ine_frente,
                    Documento = credentialRequest.ImageFront,
                    FechaRegistro = DateTime.Now,
                    Nombre = $"{TypeDocument.ine_frente}_{credentialRequest.IdPersona}.jpg"
                };

                db.DATDoctoPersona.Add(doctoPersona);
                await db.SaveChangesAsync();

                doctoPersona = new DATDoctoPersona
                {
                    IdDoctoPersona = Guid.NewGuid(),
                    IdPersona = credentialRequest.IdPersona,
                    IdTipoDocumento = (int)TypeDocument.ine_atras,
                    Documento = credentialRequest.ImageBack,
                    FechaRegistro = DateTime.Now,
                    Nombre = $"{TypeDocument.ine_frente}_{credentialRequest.IdPersona}.jpg"
                };

                db.DATDoctoPersona.Add(doctoPersona);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                throw new Exception(ex.Message);
            }
        }
    }
}
