using Elecciones.Movilizacion.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Elecciones.Movilizacion.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MenuMasterPage : MasterDetailPage
    {
        public MenuMasterPage()
        {
            InitializeComponent();
            MyMenu();
            NavigationPage.SetHasNavigationBar(this, false);
        }

        private void MyMenu()
        {
            List<MenuModel> menu = new List<MenuModel>
            {
                new MenuModel {MenuTitle = "Detectados", Icono = "detectados.png", Page = "DetectadosPage"},
                new MenuModel {MenuTitle = "Encuestas", Icono = "encuestas.pngy", Page = "EncuestasPage"},
                new MenuModel {MenuTitle = "Noticias", Icono = "noticias.png", Page = "NoticiasPage"},
                new MenuModel {MenuTitle = "Ubicaciones", Icono = "ubicacion.png", Page = "UbicacionesPage"},
                new MenuModel {MenuTitle = "Configuraciones", Icono = "configuracion.png", Page = "ConfiguracionPage"},
                new MenuModel {MenuTitle = "Salir", Icono = "salir.png", Page = "LoginPage"}
            };
            ListMenu.ItemsSource = menu;

            Detail = new NavigationPage(new DetectadosPage());
        }


        private async void ListMenu_ItemSelected(object sender, SelectedItemChangedEventArgs e)
        {
            try
            {
                if (e.SelectedItem is MenuModel menu && menu.Page != null)
                {
                    IsPresented = false;
                    //Evita que se vuelva asignar la vista que ya esté asignada
                    if (Detail.Navigation.NavigationStack[0].GetType() != menu.Page.GetType())
                        //Asigna la vista correspondiente
                        switch (menu.Page)
                        {
                            case "Detectados":
                                Detail = new NavigationPage(new DetectadosPage());
                                break;
                            case "Encuestas":
                                Detail = new NavigationPage(new EncuestasPage());
                                break;
                            case "Noticias":
                                Detail = new NavigationPage(new NoticiasPage());
                                break;
                            case "Ubicaciones":
                                Detail = new NavigationPage(new UbicacionesPage());
                                break;
                            case "Configuraciones":
                                Detail = new NavigationPage(new ConfiguracionPage());
                                break;
                            case "LoginPage":
                                var answer = await DisplayAlert("Salir!", "quiere cerrar sesion", "Yes", "No");
                                if (answer)
                                {
                                    Detail = new NavigationPage(new HomePage());
                                }
                                else
                                {
                                    Detail = new NavigationPage(new NoticiasPage());
                                }
                                break;
                        }
                }
                else
                {
                    //Evita que se vean seleccionados los items que no tienen asignada una Page
                    ListMenu.SelectedItem = null;
                }
            }
            catch (Exception ex)
            {
                string v = ex.Message;
            }
        }
    }
}