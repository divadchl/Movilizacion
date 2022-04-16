using System;
using System.Threading.Tasks;
using Xamarin.Essentials;

namespace Movilizacion.Class
{
    public class Geolocation
    {
        public static double lat { get; set; }
        public static double  lng { get; set; }

        public async Task getLocationGps()
        {
            try
            {
                var request = new GeolocationRequest(GeolocationAccuracy.Medium);
                var location = await Xamarin.Essentials.Geolocation.GetLocationAsync(request);

                if (location != null)
                {
                    lat = location.Latitude;
                    lng = location.Longitude;
                }
                else
                {
                    var knowLocation = await Xamarin.Essentials.Geolocation.GetLastKnownLocationAsync();
                    lat = knowLocation.Latitude;
                    lng = knowLocation.Latitude;
                }
            }
            catch (FeatureNotSupportedException fnsEx)
            {
                // Handle not supported on device exception
            }
            catch (FeatureNotEnabledException fneEx)
            {
                // Handle not enabled on device exception
            }
            catch (PermissionException pEx)
            {
                // Handle permission exception
            }
            catch (Exception ex)
            {
                // Unable to get location
            }
        }
    }
}
