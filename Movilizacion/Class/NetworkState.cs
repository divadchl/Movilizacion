using Xamarin.Essentials;

namespace Movilizacion.Class
{
    public class NetworkState
    {
        public static bool isConnect = false;

        //Se obtiene el estado de la red
        public void iHaveInternet()
        {
            NetworkAccess current = Connectivity.NetworkAccess;
            determineState(current);

            //Detecta el cambio en la red
            Connectivity.ConnectivityChanged += Connectivity_ConnectivityChanged;
        }

        private void Connectivity_ConnectivityChanged(object sender, ConnectivityChangedEventArgs e)
        {
            determineState(e.NetworkAccess);
        }

        //Determina el estado de la red y su metodo de conexión
        public void determineState(NetworkAccess state)
        {
            if(state == NetworkAccess.Internet)
            {
                isConnect = true;
            }
            else if(state == NetworkAccess.Local)
            {
                isConnect = true;
            }
            else if(state == NetworkAccess.ConstrainedInternet)
            {
                isConnect = false;
            }
            else
            {
                isConnect = false;
            }
        }
    }
}
