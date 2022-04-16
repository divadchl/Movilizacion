using Elecciones.Common.Models;

namespace Deteccion
{
    public class ArticleDetailViewModel : ObservableObject
    {
        #region [ Attributes ]
        private NewsNotification _newsNotification;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ArticleDetailViewModel(NewsNotification newsNotification)
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
