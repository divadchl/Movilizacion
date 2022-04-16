using Elecciones.Common.Enums;
using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.Poll;
using Elecciones.Common.Requests;
using Elecciones.Common.Responses;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.Poll;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class PollsController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();
        /// <summary>
        /// Se obtiene las encuestas que ya contestó el usuario y las que están pendientes de contestar(Detección)
        /// </summary>
        /// <param name="pollsRequest"></param>
        /// <returns>Lista de Encuestas </returns>
        [HttpPost]
        [Route("api/polls/getpolls")]
        public async Task<IHttpActionResult> GetPolls([FromBody] PollsRequest pollsRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            DATPersonas user = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == pollsRequest.IdPerson);
            Section section = await new Sections().GetSection(int.Parse(user.Seccion), int.Parse(user.NoEstado));

            if (user == null)
                return BadRequest("¡No se encontro el usuario!");

            List<PollResponse> polls = await db.DATEncuestas
                .Where(e => e.IdEstado == user.IdEstado || e.IdDistritoFederal == user.IdDistritoFederal || e.IdDistritoLocal == user.IdDistritoLocal)
                .Include(e => e.DATPreguntas)
                .Where(e => e.Vigencia >= DateTime.Now && e.Activo == true && e.IdProceso == user.IdProceso)
                .Select(p => new PollResponse
                {
                    IdPoll = p.IdEncuesta,
                    Poll = p.Encuesta,
                    NoQuestions = p.NoPregutas,
                    Validity = p.Vigencia,
                    Questions = p.DATPreguntas.Where(q => q.Activo == true).OrderBy(q => q.Pregunta).Select(q => new Question
                    {
                        IdQuestion = q.IdPregunta,
                        Query = q.Pregunta,
                        IdTypeQuestion = q.IdTipoPregunta,
                        Answers = q.DATRespuestas.Where(a => a.Activo == true).Select(a => new Answer
                        {
                            IdAnswer = a.IdRespuestas,
                            Response = a.Respuesta,
                            IdQuestion = a.IdPregunta
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            var pollsAnswerUser = await db.DATRespUsuario
                .Where(x => x.IdPersona == pollsRequest.IdPerson)
                .Select(z => new
                {
                    z.DATPreguntas.IdEncuesta
                }).Distinct().ToListAsync();

            bool flag = false;
            foreach (var poll in polls)
            {
                foreach (var item in pollsAnswerUser)
                    if (poll.IdPoll == item.IdEncuesta)
                        flag = true;

                poll.Reply = flag ? true : false;
                poll.BackgroundColor = flag ? "#22c164" : "#00a2e8";
                poll.Icon = flag ? "\ue93a" : "P";
                flag = false;
            }

            return Ok(polls.OrderByDescending(p => p.Reply));
        }

        /// <summary>
        /// Se obtiene la encuesta de acuerdo con un Id)
        /// </summary>
        /// <param name="guidRequest"></param>
        /// <returns>Encuesta</returns>
        [HttpPost]
        [Route("api/polls/getpoll")]
        public async Task<IHttpActionResult> GetPoll([FromBody] GuidRequest guidRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            PollResponse poll = await db.DATEncuestas
                .Where(e => e.IdEncuesta == guidRequest.Id)
                .Include(e => e.DATPreguntas)
                .Select(p => new PollResponse
                {
                    IdPoll = p.IdEncuesta,
                    Poll = p.Encuesta,
                    NoQuestions = p.NoPregutas,
                    Validity = p.Vigencia,
                    Questions = p.DATPreguntas.OrderBy(q => q.Pregunta).Select(q => new Question
                    {
                        IdQuestion = q.IdPregunta,
                        Query = q.Pregunta,
                        IdTypeQuestion = q.IdTipoPregunta,
                        Answers = q.DATRespuestas.Select(a => new Answer
                        {
                            IdAnswer = a.IdRespuestas,
                            Response = a.Respuesta,
                            IdQuestion = a.IdPregunta
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return Ok(poll);
        }
        /// <summary>
        /// Se reciben las respuestas de la encuesta para guardarlas (Detección)
        /// </summary>
        /// <param name="sendPollRequest"></param>
        [HttpPost]
        [Route("api/polls/sendpoll")]
        public async Task<IHttpActionResult> SendPoll([FromBody] SendPollRequest sendPollRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var person = sendPollRequest.AnswersUser.First();
            var user = await db.DATPersonas.FirstOrDefaultAsync(u => u.IdPersona == person.IdPerson);

            if (user == null)
                return BadRequest("¡El usuario no está registrado!");

            try
            {
                db.DATRespUsuario.AddRange(sendPollRequest.AnswersUser.Select(a => new DATRespUsuario
                {
                    IdRespUsuario = Guid.NewGuid(),
                    IdPregunta = a.IdQuestion,
                    IdRespuesta = a.IdAnswer,
                    RespAbierta = a.OpenResponse,
                    IdPersona = a.IdPerson
                }));

                await db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Se obtiene el listado de encuestas (Movilización)
        /// </summary>
        /// <param name="pollsRequest"></param>
        /// <returns>Lista de Encuestas</returns>
        [Authorize]
        [HttpPost]
        [Route("api/polls/getpollsmovilizacion")]
        public IHttpActionResult GetPollsMovilizacion([FromBody] PersonMovRequest personMovRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var process = ProcesoManager.GetProcesoById(personMovRequest.IdProcess);
            List<VCriteria> criteria = new List<VCriteria>
            {
                new VCriteria
                {
                    PropertyName = "IdEstado",
                    Comparer = "Equals",
                    Value = personMovRequest.IdState
                }
            };

            PollManager manager = new PollManager(false, personMovRequest.UserName, process);
            List<PollDto> list = manager.GetPollList(criteria, personMovRequest.IdProcess);

            List<PollSingleResponse> pollsValid = list
                .Where(p => p.Activo == true && p.Vigencia >= DateTime.Now)
                .Select(p => new PollSingleResponse
                {
                    IdPoll = p.Identifier,
                    Poll = p.Nombre,
                    NoQuestions = p.CantidadPreguntas,
                    Validity = p.Vigencia,
                    BackgroundColor = p.Vigencia < DateTime.Now ? "#22c164" : "#00a2e8",
                    Icon = p.Vigencia <= DateTime.Now ? "\ue93a" : "P",
                })
                .ToList();

            List<PollSingleResponse> pollsInvalid = list
                .Where(p => p.Activo == true && p.Vigencia < DateTime.Now)
                .OrderByDescending(p => p.Vigencia)
                .Select(p => new PollSingleResponse
                {
                    IdPoll = p.Identifier,
                    Poll = p.Nombre,
                    NoQuestions = p.CantidadPreguntas,
                    Validity = p.Vigencia,
                    BackgroundColor = p.Vigencia < DateTime.Now ? "#22c164" : "#00a2e8",
                    Icon = p.Vigencia <= DateTime.Now ? "\ue93a" : "P",
                })
                .Take(5)
                .ToList();

            var polls = (from valid in pollsValid select valid)
                    .Union(from invalid in pollsInvalid select invalid);

            return Ok(polls);
        }

        /// <summary>
        /// Se obtiene las preguntas y respuestas de la encuesta solicitada
        /// </summary>
        /// <param name="idEncuesta"></param>
        /// <returns>El objeto PollPercentResponse</returns>
        [Authorize]
        [HttpGet]
        [Route("api/polls/pollanswered")]
        public IHttpActionResult PollAnswered([FromUri] string idEncuesta)
        {
            PollPercentResponse pollPercent = db.DATEncuestas
                .Where(e => e.IdEncuesta.ToString() == idEncuesta)
                .Include(e => e.DATPreguntas)
                .Select(p => new PollPercentResponse
                {
                    IdEncuesta = p.IdEncuesta,
                    Encuesta = p.Encuesta,
                    QuestionsPercent = p.DATPreguntas.OrderBy(q => q.Pregunta).Select(q => new QuestionPercent
                    {
                        IdPregunta = q.IdPregunta,
                        Pregunta = q.Pregunta,
                        IdTipoPregunta = q.IdTipoPregunta,
                        AnswersPercent = q.DATRespuestas.OrderBy(a => a.Respuesta).Select(a => new AnswerPercent
                        {
                            IdRespuesta = a.IdRespuestas,
                            Respuesta = a.Respuesta,
                            TotalPorRespuestas = a.DATRespUsuario.Where(t => t.IdRespuesta == a.IdRespuestas).Count(),
                            AnswersUserPorcent = a.DATRespUsuario.Select(au => new AnswerUserPorcent
                            {
                                IdPregunta = au.IdPregunta,
                                IdRespuesta = au.IdRespuesta,
                                RespAbierta = au.RespAbierta
                            }).ToList()
                        }).ToList(),
                    }).ToList()
                }).FirstOrDefault();

            List<PollPercentResponse> respuestaAbierta = db.DATEncuestas
                .Where(e => e.IdEncuesta.ToString() == idEncuesta)
                .Include(e => e.DATPreguntas)
                .Select(p => new PollPercentResponse
                {
                    IdEncuesta = p.IdEncuesta,
                    Encuesta = p.Encuesta,
                    QuestionsPercent = p.DATPreguntas.Where(q => q.IdTipoPregunta == (int)TypeQuestion.Abierta).OrderBy(q => q.Pregunta).Select(q => new QuestionPercent
                    {
                        IdPregunta = q.IdPregunta,
                        Pregunta = q.Pregunta,
                        IdTipoPregunta = q.IdTipoPregunta,
                        AnswersUserPorcent = q.DATRespUsuario.Select(au => new AnswerUserPorcent
                        {
                            IdPregunta = au.IdPregunta,
                            IdRespuesta = au.IdRespuesta,
                            RespAbierta = au.RespAbierta
                        }).ToList()
                    }).ToList()
                }).ToList();

            foreach (QuestionPercent question in pollPercent.QuestionsPercent)
            {
                if (question.IdTipoPregunta == (int)TypeQuestion.Abierta)
                {
                    foreach (PollPercentResponse answer in respuestaAbierta)
                    {
                        foreach (var question2 in answer.QuestionsPercent)
                        {
                            if (question2.IdPregunta == question.IdPregunta)
                                question.AnswersUserPorcent = question2.AnswersUserPorcent;
                        }
                    }
                }

                var total = question.RespuestasTotal;
                foreach (var answer in question.AnswersPercent)
                {
                    answer.Porcentaje = (double)answer.TotalPorRespuestas / (double)total * 100;
                }
            }

            return Ok(pollPercent);
        }
    }
}
