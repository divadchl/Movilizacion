using Elecciones.Common.Responses;
using System;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    public class NoticePrivacyController : ApiController
    {
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [HttpGet]
        [Route("api/noticePrivacy/getnoticeprivacy")]
        public async Task<IHttpActionResult> GetNoticePrivacy()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string noticePrivacy = $"Aviso de privacidad simplificado de capacitaciones o eventos presenciales\n\n La empresa Bvir2al, S.A.de C.V., es el responsable del tratamiento de los datos personales que nos proporcione.\n\nSus datos personales, serán utilizados para las siguientes finalidades: a) Registrar su inscripción a la App; b) generar listas de asistencias y validación de las mismas; c) establecer comunicación para dar seguimiento de los cursos o aclaración de dudas sobre sus datos, notificación de cancelación o cambio de horario, fecha o sede; y e) generar estadísticas para informes obligatorios del Instituto ante otros organismos públicos o privados.\n\nDe manera adicional, utilizaremos su información personal para las siguientes finalidades que no son necesarias, pero que nos permiten y facilitan brindarle una mejor atención: a) envío de material de exposición o apoyo; y, b) invitaciones a futuros eventos.\n\nEn caso de que no desee que sus datos personales sean tratados para las finalidades adicionales, usted puede manifestarlo en el correo electrónico mydecmov @gmail.com\nSe informa que no se realizarán transferencias que requieran su consentimiento, salvo aquellas que sean necesarias para atender requerimientos de información de una autoridad competente, debidamente fundados y motivados.\n\nPara mayor información acerca del tratamiento y de los derechos que puede hacer valer, usted puede acceder al aviso de privacidad integral de cursos o eventos a través de https://www.mydecmov.com, en la sección de Avisos de Privacidad.";
                return Ok(new NoticePrivacyResponse { NoticePrivacy = noticePrivacy });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
