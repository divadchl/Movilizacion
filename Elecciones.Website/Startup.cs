using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Elecciones.Website.Startup))]
namespace Elecciones.Website
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
