using System;

namespace Elecciones.Common.Helpers
{
    public static class FormatTime
    {
        public static string TimeAgo(DateTime dateTime)
        {
            string result = string.Empty;
            var timeSpan = DateTime.Now.Subtract(dateTime);

            if (timeSpan <= TimeSpan.FromSeconds(60))
                result = $"Hace {timeSpan.Seconds} segundos";
            else if (timeSpan <= TimeSpan.FromMinutes(60))
                result = timeSpan.Minutes > 1 ? $"Hace {timeSpan.Minutes} minutos" : "Hace un minuto";
            else if (timeSpan <= TimeSpan.FromHours(24))
                result = timeSpan.Hours > 1 ? $"Hace {timeSpan.Hours} horas" : "Hace una hora";
            else if (timeSpan <= TimeSpan.FromDays(30))
                result = timeSpan.Days > 1 ? $"Hace {timeSpan.Hours} días" : "ayer";
            else if (timeSpan <= TimeSpan.FromDays(365))
                result = timeSpan.Days > 30 ? $"Hace {timeSpan.Hours / 30} meses" : "Hace un mes";
            else
                result = timeSpan.Days > 365 ? $"Hace {timeSpan.Days / 365} años" : "Hace un año";

            return result;
        }
    }
}
