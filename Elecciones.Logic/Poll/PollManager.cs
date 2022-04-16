namespace Elecciones.Logic.Poll
{
    using Elecciones.Common.Models;
    using Elecciones.Common.Models.Criteria;
    using Elecciones.Common.Models.Poll;
    using Elecciones.Common.Models.Territory;
    using Elecciones.Common.Responses;
    using Elecciones.Logic.Security;
    using Elecciones.Logic.Territory;
    using Elecciones.Models.DBSMovilizacion;
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;

    public class PollManager
    {
        bool isProcessByAdmin = false;
        private ProcesoModel proceso;
        private string userName;

        public PollManager(bool isProcessByAdmin, string userName, ProcesoModel proceso)
        {
            this.isProcessByAdmin = isProcessByAdmin;
            this.proceso = proceso;
            this.userName = userName;
        }

        public List<PollDto> GetPollList(List<VCriteria> criteria, Guid process)
        {
            using (var context = new DBDeteccionEntities())
            {
                var filter = new TerritorioFilter(userName, proceso);

                var terBuilder = new ExpressionBuilder<DATEncuestas>();
                criteria.ForEach(s => terBuilder.Request.AddProperty(s.Value, s.PropertyName, 0, s.Comparer != "Equals" ? s.Comparer : String.Empty));
                var func = terBuilder.TransformExpression();
                var datEncuestas = context.DATEncuestas.Where(p => p.IdProceso == proceso.Id).Where(func).AsQueryable();

                if (!isProcessByAdmin)
                {
                    datEncuestas = datEncuestas.Where(p => filter.Estados.Contains(p.IdEstado.Value));
                    datEncuestas = datEncuestas.Where(p => !p.IdMunicipio.HasValue || filter.Municipios.Contains(p.IdMunicipio.Value));
                    datEncuestas = datEncuestas.Where(p => !p.IdDistritoFederal.HasValue || filter.DistritosFederales.Contains(p.IdDistritoFederal.Value));
                    datEncuestas = datEncuestas.Where(p => !p.IdDistritoLocal.HasValue || filter.DistritosLocales.Contains(p.IdDistritoLocal.Value));
                }

                return datEncuestas.Select(e => new PollDto
                {
                    Identifier = e.IdEncuesta,
                    Nombre = e.Encuesta,
                    CantidadPreguntas = e.DATPreguntas.Count,
                    Vigencia = e.Vigencia,
                    Activo = e.Activo,
                    CantidadParticipantes = e.DATPreguntas.Any() ? e.DATPreguntas.FirstOrDefault().DATRespUsuario.Count : 0
                }).OrderBy(e => e.Nombre).ToList();
            }
        }

        public bool DeletePoll(Guid pollId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.First(e => e.IdEncuesta == pollId);
                if (poll != null)
                {
                    if (poll.DATPreguntas.Any())
                    {
                        if (poll.DATPreguntas.FirstOrDefault().DATRespUsuario.Count > 0)
                        {
                            return false;
                        }
                    }

                    var preguntas = context.DATPreguntas.Where(p => p.IdEncuesta == pollId);
                    var respuestas = preguntas.SelectMany(p => p.DATRespuestas);

                    context.DATRespuestas.RemoveRange(respuestas);
                    context.DATPreguntas.RemoveRange(preguntas);
                    context.DATEncuestas.Remove(poll);
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public void SetNotificationSended(Guid idEncuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    poll.NotificacionEnviada = true;
                    context.SaveChanges();
                }
            }
        }

        public bool ChangeStatusPoll(Guid idEncuesta, ref bool sendNotification)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    sendNotification = !poll.Activo.Value && !poll.NotificacionEnviada.Value;
                    poll.Activo = !poll.Activo ?? true;
                    poll.ModifiedUser = userName;
                    poll.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public string GetTagEncuesta(Guid idEncuesta, Guid idProceso)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    var tag = "";
                    if (poll.IdDistritoFederal != null && poll.IdDistritoLocal != null)
                    {
                        tag = $"federallocaldistrict:{idProceso.ToString()}_{poll.IdDistritoFederal}_{poll.IdDistritoLocal}";
                    }
                    else if (poll.IdDistritoLocal != null)
                    {
                        tag = $"localdistrict:{idProceso.ToString()}_{poll.IdDistritoLocal}";
                    }
                    else if (poll.IdDistritoFederal != null)
                    {
                        tag = $"federaldistrict:{idProceso.ToString()}_{poll.IdDistritoFederal}";
                    }
                    else if (poll.IdMunicipio != null)
                    {
                        tag = $"municipality:{idProceso.ToString()}_{poll.IdMunicipio}";
                    }
                    else if (poll.IdEstado != null)
                    {
                        tag = $"state:{idProceso.ToString()}_{poll.IdEstado}";
                    }
                    return tag;
                }
                return "Error";
            }
        }

        public bool ChangeStatusQuestion(Guid idPregunta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var pregunta = context.DATPreguntas.FirstOrDefault(p => p.IdPregunta == idPregunta);
                if (pregunta != null)
                {
                    pregunta.Activo = !pregunta.Activo ?? true;
                    pregunta.ModifiedUser = userName;
                    pregunta.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public bool DeleteQuestion(Guid idPregunta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var pregunta = context.DATPreguntas.FirstOrDefault(p => p.IdPregunta == idPregunta);
                if (pregunta != null)
                {
                    context.DATRespuestas.RemoveRange(pregunta.DATRespuestas);
                    context.DATPreguntas.Remove(pregunta);
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public bool ChangeStatusAnswer(Guid idRespuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var respuesta = context.DATRespuestas.FirstOrDefault(p => p.IdRespuestas == idRespuesta);
                if (respuesta != null)
                {
                    respuesta.Activo = !respuesta.Activo ?? true;
                    respuesta.ModifiedUser = userName;
                    respuesta.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public bool DeleteAnswer(Guid idRespuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var respuesta = context.DATRespuestas.FirstOrDefault(p => p.IdRespuestas == idRespuesta);
                if (respuesta != null)
                {
                    context.DATRespuestas.Remove(respuesta);
                    context.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public bool EditQuestion(Guid idPregunta, string pregunta, int typeId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var question = context.DATPreguntas.FirstOrDefault(e => e.IdPregunta == idPregunta);
                if (question != null)
                {
                    question.Pregunta = pregunta;
                    question.IdTipoPregunta = typeId;
                    question.ModifiedUser = userName;
                    question.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                }
                return true;
            }
        }

        public bool EditPoll(Guid idEncuesta, string encuesta, string vigencia)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    var date = DateTime.ParseExact(vigencia, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    poll.Encuesta = encuesta;
                    poll.Vigencia = date;
                    poll.ModifiedUser = userName;
                    poll.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                }
                return true;
            }
        }

        public AnswerDto AddAnswer(Guid idPregunta, string respuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var question = context.DATPreguntas.FirstOrDefault(e => e.IdPregunta == idPregunta);
                if (question != null)
                {
                    var add = new DATRespuestas
                    {
                        IdRespuestas = Guid.NewGuid(),
                        IdPregunta = idPregunta,
                        Respuesta = respuesta,
                        Activo = true,
                        InsertedUser = userName,
                        InsertedDate = DateTime.Now,
                        IdProceso = proceso.Id
                    };
                    question.DATRespuestas.Add(add);
                    context.SaveChanges();

                    return new AnswerDto
                    {
                        Identifier = add.IdRespuestas,
                        IdPregunta = add.IdPregunta,
                        Answer = add.Respuesta,
                        Activo = true,
                        CantidadParticipantes = 0
                    };
                }
                return null;
            }
        }

        public bool EditAnswer(Guid idRespuesta, string respuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var answer = context.DATRespuestas.FirstOrDefault(e => e.IdRespuestas == idRespuesta);
                if (answer != null)
                {
                    answer.Respuesta = respuesta;
                    answer.ModifiedUser = userName;
                    answer.ModifiedDate = DateTime.Now;
                    context.SaveChanges();
                }
                return true;
            }
        }

        public QuestionDto AddQuestion(Guid idEncuesta, string pregunta, int typeId)
        {
            using (var context = new DBDeteccionEntities())
            {
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    var add = new DATPreguntas
                    {
                        IdPregunta = Guid.NewGuid(),
                        IdEncuesta = idEncuesta,
                        IdTipoPregunta = typeId,
                        Pregunta = pregunta,
                        Activo = true,
                        InsertedUser = userName,
                        InsertedDate = DateTime.Now,
                        IdProceso = proceso.Id
                    };
                    poll.DATPreguntas.Add(add);
                    poll.NoPregutas = poll.NoPregutas + 1;
                    context.SaveChanges();

                    return new QuestionDto
                    {
                        Identifier = add.IdPregunta,
                        Question = add.Pregunta,
                        IsIndividual = typeId == 1,
                        IsMultiple = typeId == 2,
                        IsOpen = typeId == 3,
                        Activo = true
                    };
                }
                return null;
            }
        }

        public PollDto GetPoll(Guid idEncuesta)
        {
            using (var context = new DBDeteccionEntities())
            {
                var random = new Random();
                var poll = context.DATEncuestas.FirstOrDefault(e => e.IdEncuesta == idEncuesta);
                if (poll != null)
                {
                    return new PollDto
                    {
                        Identifier = poll.IdEncuesta,
                        Nombre = poll.Encuesta,
                        CantidadPreguntas = poll.DATPreguntas.Count,
                        Vigencia = poll.Vigencia,
                        CantidadParticipantes = poll.DATPreguntas.Any() ? poll.DATPreguntas.FirstOrDefault().DATRespUsuario.Count : 0,
                        Activo = poll.Activo,
                        Preguntas = poll.DATPreguntas.Select(p => new QuestionDto
                        {
                            Identifier = p.IdPregunta,
                            IdPregunta = p.IdPregunta,
                            Question = p.Pregunta,
                            IsIndividual = p.IdTipoPregunta == 1,
                            IsMultiple = p.IdTipoPregunta == 2,
                            IsOpen = p.IdTipoPregunta == 3,
                            IdTipoPregunta = p.IdTipoPregunta,
                            CantidadParticipantes = p.DATRespUsuario.Count,
                            Activo = p.Activo,
                            OpenAnswers = p.IdTipoPregunta == 3 ? p.DATRespUsuario.Select(d => d.RespAbierta).ToList() : new List<string>(),
                            AnswerList = p.DATRespuestas.Select(r => new AnswerDto
                            {
                                Identifier = r.IdRespuestas,
                                IdPregunta = r.IdPregunta,
                                Answer = r.Respuesta,
                                Activo = r.Activo,
                                CantidadParticipantes = r.DATRespUsuario.Count
                            }).OrderBy(r => r.CantidadParticipantes).ToList()
                        }).OrderBy(r => r.CantidadParticipantes).ToList()
                    };
                }
                return null;
            }
        }

        public Guid AddPoll(List<VCriteria> criteria, string encuesta, string vigencia)
        {
            using (var context = new DBDeteccionEntities())
            {
                var idEstado = criteria.Any(c => c.PropertyName == "IdEstado") ? criteria.First(c => c.PropertyName == "IdEstado").Value : null;
                var idMunicipio = criteria.Any(c => c.PropertyName == "IdMunicipio") ? criteria.First(c => c.PropertyName == "IdMunicipio").Value : null;
                var idDistritoFederal = criteria.Any(c => c.PropertyName == "IdDistritoFederal") ? criteria.First(c => c.PropertyName == "IdDistritoFederal").Value : null;
                var idDistritoLocal = criteria.Any(c => c.PropertyName == "IdDistritoLocal") ? criteria.First(c => c.PropertyName == "IdDistritoLocal").Value : null;
                var date = DateTime.ParseExact(vigencia, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var newPoll = new DATEncuestas
                {
                    IdEncuesta = Guid.NewGuid(),
                    Encuesta = encuesta,
                    Vigencia = date,
                    NoPregutas = 0,
                    IdEstado = idEstado,
                    IdMunicipio = idMunicipio,
                    IdDistritoFederal = idDistritoFederal,
                    IdDistritoLocal = idDistritoLocal,
                    Activo = false,
                    InsertedUser = userName,
                    InsertedDate = DateTime.Now,
                    IdProceso = proceso.Id,
                    NotificacionEnviada = false
                };
                context.DATEncuestas.Add(newPoll);
                context.SaveChanges();
                return newPoll.IdEncuesta;
            }
        }

    }
}
