using System.Collections.ObjectModel;
using UXDivers.Grial;
using Movilizacion.Models;

namespace Movilizacion
{
    public class ChatMainViewModel : ObservableObject
    {
        public ChatMainViewModel()
        {
            //LoadData();
        }

        //public ObservableCollection<Detectados> Contacts { get; } = new ObservableCollection<Detectados>();
        //public ObservableCollection<Detectados> Conversations { get; } = new ObservableCollection<Detectados>();

        private void LoadData()
        {
            //Contacts.Clear();
            //Conversations.Clear();

            //JsonHelper.Instance.LoadViewModel(this, source: "ChatFlow.json");
        }
    }
}
