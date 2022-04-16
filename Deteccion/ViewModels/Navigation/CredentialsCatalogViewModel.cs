using Deteccion.Helpers;
using Deteccion.Models;
using Elecciones.Common.Enums;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Deteccion.ViewModels.Navigation
{
    public class CredentialsCatalogViewModel : ObservableObject
    {
        #region [ Constructor ]
        public CredentialsCatalogViewModel()
        {
            LoadData();
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public ObservableCollection<TypeCredentials> Credentials { get; set; } = new ObservableCollection<TypeCredentials>();
        #endregion [ Properties ]

        #region [ Methods ]
        private void LoadData()
        {
            Credentials.Clear();

            List<TypeCredentials> lst = new List<TypeCredentials>();
            lst.Add(new TypeCredentials { Id = 1, ImageFront = TextStrings.CredentialFrontC, ImageBack = TextStrings.CredentialBackC, IsVisibleLeft = false, IsVisibleRight = true, TypeCredential = TypeCredential.TipoC });
            lst.Add(new TypeCredentials { Id = 2, ImageFront = TextStrings.CredentialFrontDEF, ImageBack = TextStrings.CredentialBackDEF, IsVisibleLeft = true, IsVisibleRight = true, TypeCredential = TypeCredential.TipoDEF });
            lst.Add(new TypeCredentials { Id = 3, ImageFront = TextStrings.CredentialFrontGH, ImageBack = TextStrings.CredentialBackGH, IsVisibleLeft = true, IsVisibleRight = false, TypeCredential = TypeCredential.TipoGH });
            Credentials = new ObservableCollection<TypeCredentials>(lst);
        }
        #endregion [ Methods ]
    }
}
