using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Models.Criteria;
using Elecciones.Common.Models.News;
using Elecciones.Common.Requests;
using Elecciones.Logic.Deteccion;
using Elecciones.Logic.News;
using Elecciones.Logic.Security;
using Elecciones.Models.DBSMovilizacion;
using OpenGraphNet;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Elecciones.Website.Areas.Api.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/news")]
    public class NewsController : ApiController
    {
        private DBDeteccionEntities db = new DBDeteccionEntities();

        [HttpPost]
        [Route("getnews")]
        public async Task<IHttpActionResult> GetNews([FromBody] PersonRequest personRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            DATPersonas user = await db.DATPersonas.FirstOrDefaultAsync(p => p.IdPersona == personRequest.IdPerson);
            Section section = await new Sections().GetSection(int.Parse(user.Seccion), int.Parse(user.NoEstado));
            
            if (user == null)
                return BadRequest("¡No se encontro el usuario!");

            List<DATNoticias> news = await db.DATNoticias
                .Where(n => n.IdEstado == section.IdState || n.IdDistritoFederal == section.IdFederalDistrict || n.IdDistritoLocal == section.IdLocalDistrict)
                .Where(n => n.Activo == true && n.IdProceso == personRequest.IdProcess)
                .OrderByDescending(n => n.Fecha)
                .Take(10)
                .ToListAsync();
            return Ok(await ParseUrl(news));
        }

        [HttpPost]
        [Route("getnewsitem")]
        public async Task<IHttpActionResult> GetNewsItem([FromBody] GuidRequest guidRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            RegexHelper regexHelper = new RegexHelper();
            NewsNotification newsNotification = null;

            DATNoticias newsItem = await db.DATNoticias.FirstOrDefaultAsync(n => n.IdNoticia == guidRequest.Id);

            if (newsItem == null)
                return BadRequest("¡La noticia no ha sido encontrada!");

            if (regexHelper.ValidateUrl(newsItem.Link))
            {
                OpenGraph openGraph = await OpenGraph.ParseUrlAsync(newsItem.Link);
                string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
                
                newsNotification = new NewsNotification
                {
                    Title = openGraph.Title,
                    Type = openGraph.Type,
                    UriImage = openGraph.Image.ToString(),
                    UrlNews = openGraph.OriginalUrl.ToString(),
                    Description = openGraph.Metadata["og:description"].ElementAt(0).Value,
                    Content = content.Replace("<br>", "\n")
                };
            }
            return Ok(newsNotification);
        }

        [Authorize]
        [HttpPost]
        [Route("getnewsmovilizacion")]
        public async Task<IHttpActionResult> GetNewsMovilizacion([FromBody] PersonMovRequest personMovRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            ProcesoModel process = ProcesoManager.GetProcesoById(personMovRequest.IdProcess);
            List<VCriteria> criteria = new List<VCriteria>
            {
                new VCriteria
                {
                    PropertyName = "IdEstado",
                    Comparer = "Equals",
                    Value = personMovRequest.IdState
                }
            };

            NewsManager manager = new NewsManager(false, personMovRequest.UserName, process);
            List<NewDto> list = manager.GetNews(criteria, personMovRequest.IdProcess);
            return Ok(await ParseUrl(list));
        }

        #region [ Helpers ]
        private string GetBetween(string strSource, string strStart, string strEnd)
        {
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                int start = strSource.IndexOf(strStart, 0) + strStart.Length;
                int end = strSource.IndexOf(strEnd, start);
                return strSource.Substring(start, end - start);
            }

            return string.Empty;
        }

        private async Task<List<NewsNotification>> ParseUrl(List<NewDto> news)
        {
            List<NewsNotification> listNews = new List<NewsNotification>();
            RegexHelper regexHelper = new RegexHelper();

            foreach (NewDto item in news)
            {
                if (regexHelper.ValidateUrl(item.Link))
                {
                    OpenGraph openGraph = await OpenGraph.ParseUrlAsync(item.Link);
                    string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
                    listNews.Add(new NewsNotification
                    {
                        Title = openGraph.Title,
                        Type = openGraph.Type,
                        UriImage = openGraph.Image.ToString(),
                        UrlNews = openGraph.OriginalUrl.ToString(),
                        Description = openGraph.Metadata["og:description"].ElementAt(0).Value,
                        Content = content.Replace("<br>", "\n")
                    });
                }
            }
            return listNews;
        }

        private async Task<List<NewsNotification>> ParseUrl(List<DATNoticias> news)
        {
            List<NewsNotification> listNews = new List<NewsNotification>();
            RegexHelper regexHelper = new RegexHelper();

            foreach (DATNoticias item in news)
            {
                if (regexHelper.ValidateUrl(item.Link))
                {
                    OpenGraph openGraph = await OpenGraph.ParseUrlAsync(item.Link);
                    string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
                    listNews.Add(new NewsNotification
                    {
                        Title = openGraph.Title,
                        Type = openGraph.Type,
                        UriImage = openGraph.Image.ToString(),
                        UrlNews = openGraph.OriginalUrl.ToString(),
                        Description = openGraph.Metadata["og:description"].ElementAt(0).Value,
                        Content = content.Replace("<br>", "\n")
                    });
                }
            }
            return listNews;
        }
        #endregion [ Helpers ]

        [HttpGet]
        [Route("getnew")]
        public async Task<IHttpActionResult> GetNew(string link)
        {
            OpenGraph openGraph = await OpenGraph.ParseUrlAsync(link);
            string content = GetBetween(openGraph.OriginalHtml, "<div class=\"pint-nota\">", "</div>");
            string description = openGraph.Metadata["og:description"].ElementAt(0).Value;
            return Ok(openGraph);
        }
    }
}
