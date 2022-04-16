using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Runtime.CompilerServices;
using UXDivers.Grial;

namespace Movilizacion
{
    /// <summary>
    /// Simple implementation of INotifyPropertyChanged.
    /// </summary>
    public class ObservableObject : INotifyPropertyChanged
    {
        #region [ Attributes ]
        string title = string.Empty;
        public event PropertyChangedEventHandler PropertyChanged;
        private readonly CultureChangeNotifier _notifier;
        #endregion [ Attributes ]

        #region [ Constructor ]
        public ObservableObject(bool listenCultureChanges = false)
        {
            if (listenCultureChanges)
            {
                // Listen culture changes so they can be handled 
                // by derived viewmodels if needed
                _notifier = new CultureChangeNotifier();
                _notifier.CultureChanged += CultureChanged;
            }
        }
        #endregion [ Constructor ]

        #region [ Properties ]
        public string Title
        {
            get => title;
            set => SetProperty(ref title, value);
        }
        #endregion [ Properties ]

        #region [ Methods ]
        protected void NotifyAllPropertiesChanged()
        {
            NotifyPropertyChanged(null);
        }

        protected bool SetProperty<T>(
            ref T backingStore,
            T value,
            [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
            {
                return false;
            }

            backingStore = value;
            NotifyPropertyChanged(propertyName);

            return true;
        }

        protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected virtual void OnCultureChanged(CultureInfo culture)
        {
        }

        private void CultureChanged(object sender, CultureChangeEventArgs args)
        {
            OnCultureChanged(args.NewCulture);
        }
        #endregion [ Methods ]
    }
}