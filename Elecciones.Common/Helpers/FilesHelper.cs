using System;
using System.IO;

namespace Elecciones.Common.Helpers
{
    public class FilesHelper
    {
        public byte[] ReadFully(Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.CopyTo(ms);
                return ms.ToArray();
            }
        }

        public string ImageToString(Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.CopyTo(ms);
                var stream = ms.ToArray();
                return Convert.ToBase64String(stream);
            }
        }

        public Stream StringToImage(string base64String)
        {
            var bytes = Convert.FromBase64String(base64String);
            var stream = new MemoryStream(bytes);
            return stream;
        }

        public Stream ArrayToImage(byte[] bytes) => new MemoryStream(bytes);

    }
}
