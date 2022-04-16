using Elecciones.Common.Models;

namespace Movilizacion.ViewModels.Articles
{
    public class NewsDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private NewsNotification _newsNotification;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public NewsDetailViewModel(NewsNotification newsNotification)
        {
            _newsNotification = newsNotification;
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public NewsNotification NewsNotification
        {
            get => _newsNotification;
            set => SetProperty(ref _newsNotification, value);
        }
        #endregion [ Properties ]
    }
}
