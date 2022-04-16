using Movilizacion.Business;
using Movilizacion.Models;
using SQLite;
using System;
using System.Collections.Generic;

namespace Movilizacion.Helpers
{
    public class NotificationRepository
    {
        #region [ Attributes ]
        SQLiteConnection connection;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public NotificationRepository()
        {
            connection = new SQLiteConnection(ConstantsSQLite.DatabasePath, ConstantsSQLite.Flags);
            connection.CreateTable<Notification>();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string StatusMessage { get; set; }
        #endregion [ Properties ]

        #region [ Methods ]
        public void AddOrUpdate(Notification Notification)
        {
            int result = 0;
            try
            {
                if (Notification.Id != 0)
                {
                    result = connection.Update(Notification);
                    StatusMessage = $"{result} registro(s) actualizado(s)";
                }
                else
                {
                    result = connection.Insert(Notification);
                    StatusMessage = $"{result} registro(s) agregado(s)";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error: {ex.Message}";
            }
        }

        public List<Notification> GetAll()
        {
            try
            {
                return connection.Table<Notification>().OrderByDescending(n => n.DateNotification).ToList();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error {ex.Message}";
            }
            return null;
        }

        public Notification Get(int id)
        {
            try
            {
                return connection.Table<Notification>().FirstOrDefault(x => x.Id == id);
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error {ex.Message}";
            }
            return null;
        }

        public List<Notification> GetAll2()
        {
            try
            {
                return connection.Query<Notification>("SELECT * FROM Notifications");
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error: {ex.Message}";
            }
            return null;
        }

        public void Delete(int id)
        {
            try
            {
                var Notification = Get(id);
                connection.Delete(Notification);
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error : {ex.Message}";
            }
        }
        #endregion [ Methods ]
    }
}
