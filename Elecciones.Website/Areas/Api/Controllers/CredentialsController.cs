using Elecciones.Common.Enums;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.Services;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class CredentialsController : ApiController
    {
        /// <summary>
        /// Se reciiben la credencial de elector y se gaurda la información
        /// </summary>
        /// <param name="credentialRequest"></param>
        [HttpPost]
        [Route("api/credentials/recognizercredential")]
        public async Task<IHttpActionResult> RecognizerCredentialFront([FromBody] CredentialRequest credentialRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            FormRecognizerService formRecognizerService = new FormRecognizerService();
            PersonResponse personResponse = new PersonResponse();
            Credentials credentials = new Credentials();
            string type = credentialRequest.TypeCredential.ToString();

            if (type.Equals(nameof(TypeCredential.TipoC)))
            {
                var (credentialTypeC, message) = await formRecognizerService.RecognizeContentTypeC(credentialRequest);
                if (credentialTypeC == null)
                    return BadRequest($"¡Error al procesar la información de la credencial!\n{message}\n- Enfoca y centra la credencial al tomar la foto.\n- Trata de no usar el flash");
                
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    using (DbContextTransaction transaction = db.Database.BeginTransaction())
                    {
                        try
                        {
                            UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email == credentialRequest.User.Email);
                            if (user == null)
                                BadRequest("¡No se encontró el usuario!");
                            
                            var validCredential = db.DATPersonas.Where(p => p.ClaveINE.Equals(credentialTypeC.ClaveElector)).FirstOrDefault();
                            if (validCredential != null)
                                throw new Exception("La credencial ya está registrada");

                            user.isRegister = true;
                            db.Entry(user).State = EntityState.Modified;
                            await db.SaveChangesAsync();

                            DATPersonas persona = new DATPersonas
                            {
                                IdPersona = Guid.NewGuid(),
                                Paterno = credentialTypeC.ApellidoPaterno,
                                Materno = credentialTypeC.ApellidoMaterno,
                                Nombre = credentialTypeC.Nombre,
                                Calle = credentialTypeC.Calle,
                                Colonia = credentialTypeC.Colonia,
                                CP = credentialTypeC.CP,
                                Municipio = credentialTypeC.Municipio,
                                Estado = credentialTypeC.Estado,
                                ClaveINE = credentialTypeC.ClaveElector,
                                CURP = credentialTypeC.CURP,
                                RegistroINE = credentialTypeC.AñoRegistro,
                                NoEstado = credentialTypeC.NoEstado,
                                NoMunicipio = credentialTypeC.NoMunicipio,
                                Seccion = credentialTypeC.Seccion,
                                Emision = credentialTypeC.Emision,
                                Vigencia = credentialTypeC.Vigencia,
                                OCR = credentialTypeC.OCR.ToString(),
                                CIC = string.Empty,
                                NoEmision = credentialTypeC.NumEmision,
                                Usuario = "",
                                FechaRegistro = DateTime.Now,
                                IdUsuario = credentialRequest.User.IdUser,
                                IdPadre = credentialRequest.IdPater,
                                IdTipoCredencial =  (int)TypeCredential.TipoC,
                                IdProceso = credentialRequest.IdProcess,
                                IdUserPadre = credentialRequest.IdUserPater
                            };

                            db.DATPersonas.Add(persona);
                            await db.SaveChangesAsync();

                            bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                                int.Parse(credentialTypeC.Seccion),
                                int.Parse(credentialTypeC.NoEstado),
                                persona.IdPersona,
                                (Guid)persona.IdProceso,
                                credentialRequest.DeviceRegistration);

                            if (!updateRegisterDevice)
                                throw new ArgumentException("Error al registrar el dispositivo para las notificaciones");

                            credentialRequest.IdPersona = persona.IdPersona;
                            await credentials.SaveImages(db, credentialRequest);

                            personResponse.IdPerson = persona.IdPersona;
                            personResponse.Calle = credentialTypeC.Calle;
                            transaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            return BadRequest(ex.Message);
                        }
                    }
                }
            }
            else if (type.Equals(nameof(TypeCredential.TipoDEF)))
            {
                var (credentialTypeDEF, message) = await formRecognizerService.RecognizeContentTypeDEF(credentialRequest);
                if (credentialTypeDEF == null)
                    return BadRequest($"¡Error al procesar la información de la credencial!\n{message}\n- Enfoca y centra la credencial al tomar la foto.\n-Las imagenes de la credencial deben quedar de forma horizontal\n- Evita usar el flash.");
                
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    using (DbContextTransaction transaction = db.Database.BeginTransaction())
                    {
                        try
                        {
                            UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email == credentialRequest.User.Email);
                            if (user == null)
                                BadRequest("¡No se encontró el usuario!");

                            var validCredential = db.DATPersonas.Where(p => p.ClaveINE.Equals(credentialTypeDEF.ClaveElector)).FirstOrDefault();
                            if (validCredential != null)
                                throw new Exception("La credencial ya está registrada");

                            user.isRegister = true;
                            db.Entry(user).State = EntityState.Modified;
                            await db.SaveChangesAsync();

                            DATPersonas persona = new DATPersonas
                            {
                                IdPersona = Guid.NewGuid(),
                                Paterno = credentialTypeDEF.ApellidoPaterno,
                                Materno = credentialTypeDEF.ApellidoMaterno,
                                Nombre = credentialTypeDEF.Nombre,
                                Calle = credentialTypeDEF.Calle,
                                Colonia = credentialTypeDEF.Colonia,
                                CP = credentialTypeDEF.CP,
                                Municipio = credentialTypeDEF.Municipio,
                                Estado = credentialTypeDEF.Estado,
                                ClaveINE = credentialTypeDEF.ClaveElector,
                                CURP = credentialTypeDEF.CURP,
                                RegistroINE = credentialTypeDEF.AñoRegistro,
                                NoEstado = credentialTypeDEF.NoEstado,
                                NoMunicipio = credentialTypeDEF.NoMunicipio,
                                Seccion = credentialTypeDEF.Seccion,
                                Emision = credentialTypeDEF.Emision,
                                Vigencia = credentialTypeDEF.Vigencia,
                                CIC = credentialTypeDEF.CIC.Substring(0, 15),
                                OCR = credentialTypeDEF.CIC.Substring(17, 13),
                                NoEmision = credentialTypeDEF.NumEmision,
                                Usuario = "",
                                FechaRegistro = DateTime.Now,
                                IdUsuario = credentialRequest.User.IdUser,
                                IdPadre = credentialRequest.IdPater,
                                IdTipoCredencial = (int)TypeCredential.TipoDEF,
                                IdProceso = credentialRequest.IdProcess,
                                IdUserPadre = credentialRequest.IdUserPater
                            };
                            db.DATPersonas.Add(persona);
                            await db.SaveChangesAsync();

                            bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                                int.Parse(credentialTypeDEF.Seccion),
                                int.Parse(credentialTypeDEF.NoEstado),
                                persona.IdPersona,
                                (Guid)persona.IdProceso,
                                credentialRequest.DeviceRegistration);

                            if (!updateRegisterDevice)
                                throw new ArgumentException("Error al registrar el dispositivo para las notificaciones");

                            credentialRequest.IdPersona = persona.IdPersona;
                            await credentials.SaveImages(db, credentialRequest);

                            personResponse.IdPerson = persona.IdPersona;
                            personResponse.Calle = credentialTypeDEF.Calle;

                            transaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            return BadRequest(ex.Message);
                        }
                    }
                }
            }
            else if (type.Equals(nameof(TypeCredential.TipoGH)))
            {
                var(credentialTypeGH, message) = await formRecognizerService.RecognizeContentTypeGH(credentialRequest);
                if (credentialTypeGH == null)
                    return BadRequest($"¡Error al procesar la información de la credencial!\n{message}\n- Enfoca y centra la credencial al tomar la foto.\n- Trata de no usar el flash");
                
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    using (DbContextTransaction transaction = db.Database.BeginTransaction())
                    {
                        try
                        {
                            UsersDeteccion user = await db.UsersDeteccion.FirstOrDefaultAsync(u => u.email == credentialRequest.User.Email);
                            if (user == null)
                                BadRequest("¡No se encontró el usuario!");

                            var validCredential = db.DATPersonas.Where(p => p.ClaveINE.Equals(credentialTypeGH.ClaveElector)).FirstOrDefault();
                            if (validCredential != null)
                                throw new Exception("La credencial ya está registrada");

                            user.isRegister = true;
                            db.Entry(user).State = EntityState.Modified;
                            await db.SaveChangesAsync();

                            DATPersonas persona = new DATPersonas
                            {
                                IdPersona = Guid.NewGuid(),
                                Paterno = credentialTypeGH.ApellidoPaterno,
                                Materno = credentialTypeGH.ApellidoMaterno,
                                Nombre = credentialTypeGH.Nombre,
                                Calle = credentialTypeGH.Calle,
                                Colonia = credentialTypeGH.Colonia,
                                CP = credentialTypeGH.CP,
                                Municipio = credentialTypeGH.Municipio,
                                Estado = credentialTypeGH.Estado,
                                ClaveINE = credentialTypeGH.ClaveElector,
                                CURP = credentialTypeGH.CURP,
                                RegistroINE = credentialTypeGH.AñoRegistro,
                                NoEstado = credentialRequest.State.ToString(),
                                NoMunicipio = string.Empty,
                                Seccion = credentialTypeGH.Seccion,
                                Emision = credentialTypeGH.Emision,
                                Vigencia = credentialTypeGH.Vigencia,
                                CIC = credentialTypeGH.CIC.Substring(0, 15),
                                OCR = credentialTypeGH.CIC.Substring(17, 13),
                                NoEmision = credentialTypeGH.NumEmision,
                                Usuario = "",
                                FechaRegistro = DateTime.Now,
                                IdUsuario = credentialRequest.User.IdUser,
                                IdPadre = credentialRequest.IdPater,
                                IdTipoCredencial = (int)TypeCredential.TipoGH,
                                IdProceso = credentialRequest.IdProcess,
                                IdUserPadre = credentialRequest.IdUserPater
                            };
                            db.DATPersonas.Add(persona);
                            await db.SaveChangesAsync();

                            bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                                int.Parse(credentialTypeGH.Seccion),
                                credentialRequest.State,
                                persona.IdPersona,
                                (Guid)persona.IdProceso,
                                credentialRequest.DeviceRegistration);

                            if (!updateRegisterDevice)
                                throw new ArgumentException("Error al registrar el dispositivo para las notificaciones");

                            credentialRequest.IdPersona = persona.IdPersona;
                            await credentials.SaveImages(db, credentialRequest);

                            personResponse.IdPerson = persona.IdPersona;
                            personResponse.Calle = credentialTypeGH.Calle;

                            transaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            return BadRequest(ex.Message);
                        }
                    }
                }
            }
            
            return Ok(personResponse);
        }

        /// <summary>
        /// Se registra el domicilio de la persona, cuando el domicilio de la credencial de elector no coincide con su domicilio actual
        /// </summary>
        /// <param name="addressFullRequest"></param>
        [HttpPost]
        [Route("api/credentials/registeraddress")]
        public async Task<IHttpActionResult> RegisterAddress([FromBody] AddressFullRequest addressFullRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                using(DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    var person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == addressFullRequest.IdPersona);
                    if (person == null)
                        return BadRequest("No se encontró a la persona");

                    var address = await db.DATDomicilios.Where(a => a.IdPersona == addressFullRequest.IdPersona).FirstOrDefaultAsync();

                    if (address != null)
                    {
                        db.DATDomicilios.Remove(address);
                        await db.SaveChangesAsync();
                    }

                    DATDomicilios dATDomicilios = new DATDomicilios
                    {
                        IdDomicilio = Guid.NewGuid(),
                        Calle = addressFullRequest.Address.Street,
                        NoExterior = addressFullRequest.Address.OutdoorNumber,
                        NoInterior = addressFullRequest.Address.InteriorNumber,
                        Colonia = addressFullRequest.Address.Colony,
                        CATEstado = await db.CATEstado.FirstAsync(e => e.IdEstado.Equals(addressFullRequest.Address.State)),
                        CATMunicipios = await db.CATMunicipios.FirstAsync(m => m.IdMunicipio.Equals(addressFullRequest.Address.Municipality)),
                        CP = addressFullRequest.Address.CP,
                        IdPersona = addressFullRequest.IdPersona
                    };

                    db.DATDomicilios.Add(dATDomicilios);
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(new Response { IsSuccess = true });
        }

        /// <summary>
        /// Se registra la calle, número exterior o número interior, cuando la credencial de elector no tiene calle y número
        /// </summary>
        /// <param name="addressINERequest"></param>
        [HttpPost]
        [Route("api/credentials/registeraddressINE")]
        public async Task<IHttpActionResult> RegisterAddressINE([FromBody] AddressINERequest addressINERequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    var person = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == addressINERequest.IdPersona);
                    if (person == null)
                        return BadRequest("No se encontró a la persona");

                    person.Calle = addressINERequest.Address.Street == null ? addressINERequest.Address.Street : addressINERequest.Address.Street.ToUpper();
                    person.NoExterior = addressINERequest.Address.OutdoorNumber == null ? addressINERequest.Address.OutdoorNumber : addressINERequest.Address.OutdoorNumber.ToUpper();
                    person.NoInterior = addressINERequest.Address.InteriorNumber == null ? addressINERequest.Address.InteriorNumber : addressINERequest.Address.InteriorNumber.ToUpper();
                    await db.SaveChangesAsync();
                    return Ok(new Response { IsSuccess = true });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se reciiben la credencial de elector y se gaurda la información
        /// </summary>
        /// <param name="credentialRequest"></param>
        [HttpPost]
        [Route("api/credentials/changerecognizercredential")]
        public async Task<IHttpActionResult> ChangeRecognizerCredentialFront([FromBody] CredentialRequest credentialRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            FormRecognizerService formRecognizerService = new FormRecognizerService();
            PersonResponse personResponse = new PersonResponse();
            Credentials credentials = new Credentials();
            
            var (credentialTypeGH, message) = await formRecognizerService.RecognizeContentTypeGH(credentialRequest);
            if (credentialTypeGH == null)
                return BadRequest($"¡Error al procesar la información de la credencial!\n{message}\n- Enfoca y centra la credencial al tomar la foto.\n- Trata de no usar el flash");

            using (DBDeteccionEntities db = new DBDeteccionEntities())
            {
                using (DbContextTransaction transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        DATPersonas person = await db.DATPersonas.Where(p => p.IdPersona == credentialRequest.IdPersona).FirstOrDefaultAsync();
                        if (person == null)
                            throw new Exception("La persona no se encuentra registrada");

                        if(!person.ClaveINE.Substring(0, 15).Equals(credentialTypeGH.ClaveElector.Substring(0, 15)))
                            throw new Exception("¡La Clave de Elector no coincide con tu registro previo!");

                        person.Paterno = credentialTypeGH.ApellidoPaterno;
                        person.Materno = credentialTypeGH.ApellidoMaterno;
                        person.Nombre = credentialTypeGH.Nombre;
                        person.Calle = credentialTypeGH.Calle;
                        person.Colonia = credentialTypeGH.Colonia;
                        person.CP = credentialTypeGH.CP;
                        person.Municipio = credentialTypeGH.Municipio;
                        person.Estado = credentialTypeGH.Estado;
                        person.ClaveINE = credentialTypeGH.ClaveElector;
                        person.CURP = credentialTypeGH.CURP;
                        person.RegistroINE = credentialTypeGH.AñoRegistro;
                        person.NoEstado = credentialRequest.State.ToString();
                        person.Seccion = credentialTypeGH.Seccion;
                        person.Emision = credentialTypeGH.Emision;
                        person.Vigencia = credentialTypeGH.Vigencia;
                        person.CIC = credentialTypeGH.CIC.Substring(0, 15);
                        person.OCR = credentialTypeGH.CIC.Substring(17, 13);
                        person.NoEmision = credentialTypeGH.NumEmision;
                        person.FechaRegistro = DateTime.Now;
                        person.IdTipoCredencial = (int)TypeCredential.TipoGH;
                            
                        await db.SaveChangesAsync();

                        bool updateRegisterDevice = await new Notifications().UpdateRegisterDevice(
                            int.Parse(credentialTypeGH.Seccion),
                            credentialRequest.State,
                            person.IdPersona,
                            (Guid)person.IdProceso,
                            credentialRequest.DeviceRegistration);

                        if (!updateRegisterDevice)
                            throw new ArgumentException("Error al registrar el dispositivo para las notificaciones");

                        credentialRequest.IdPersona = credentialRequest.IdPersona;
                        await credentials.UpdateImages(db, credentialRequest);

                        personResponse.IdPerson = person.IdPersona;
                        personResponse.Calle = credentialTypeGH.Calle;

                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return BadRequest(ex.Message);
                    }
                }
            }

            return Ok(personResponse);
        }

        /// <summary>
        /// Se reciiben la credencial de elector y se gaurda la información
        /// </summary>
        /// <param name="credentialRequest"></param>
        [HttpPost]
        [Route("api/credentials/resendcic")]
        public async Task<IHttpActionResult> ResendCICAsync([FromBody] ResendCICRequest resendCICRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                using (DBDeteccionEntities db = new DBDeteccionEntities())
                {
                    var person = await db.DATPersonas.FirstOrDefaultAsync(u => u.IdPersona == resendCICRequest.IdPerson);
                    if (person == null)
                        BadRequest("¡No se encontró el usuario!");

                    if (resendCICRequest.TypeCredential == TypeCredential.TipoC)
                    {
                        person.ClaveINE = resendCICRequest.ClaveElector;
                        person.Emision = resendCICRequest.NoEmision;
                        person.OCR = resendCICRequest.OCR;
                    }
                    else if (resendCICRequest.TypeCredential == TypeCredential.TipoDEF || resendCICRequest.TypeCredential == TypeCredential.TipoGH)
                    {
                        person.OCR = resendCICRequest.OCR;
                        person.CIC = resendCICRequest.CIC;
                    }

                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                BadRequest(ex.Message);
            }

            return Ok(new Response { IsSuccess = true });
        }

        //TODO Eliminar
        #region [ Pruebas ]
        [HttpPost]
        [Route("api/credentials/recognizercredential2")]
        public async Task<IHttpActionResult> RecognizerCredentialFront2([FromBody] CredentialRequest credentialRequest)
        {
            FormRecognizerService formRecognizerService = new FormRecognizerService();
            string type = credentialRequest.TypeCredential.ToString();

            if (type.Equals(nameof(TypeCredential.TipoC)))
            {
                var (credentialTypeC, message) = await formRecognizerService.RecognizeContentTypeC(credentialRequest);
                return Ok(credentialTypeC);
            }
            else if (type.Equals(nameof(TypeCredential.TipoDEF)))
            {
                var (credentialTypeDEF, message) = await formRecognizerService.RecognizeContentTypeDEF(credentialRequest);
                return Ok(credentialTypeDEF);
            }
            else if (type.Equals(nameof(TypeCredential.TipoGH)))
            {
                var (credentialTypeGH, message) = await formRecognizerService.RecognizeContentTypeGH(credentialRequest);
                return Ok(credentialTypeGH);
            }

            return Ok();
        }
        #endregion
    }
}
