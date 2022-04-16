using Deteccion.ItemViewModels;
using Deteccion.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Deteccion.Services
{
    public class ContactEventArgs : EventArgs
    {
        public ContactItemViewModel Contact { get; }
        public ContactEventArgs(ContactItemViewModel contact)
        {
            Contact = contact;
        }
    }
    public interface IContactsService
    {
        event EventHandler<ContactEventArgs> OnContactLoaded;
        bool IsLoading { get; }
        Task<IList<ContactItemViewModel>> RetrieveContactsAsync(CancellationToken? token = null);
    }
}
