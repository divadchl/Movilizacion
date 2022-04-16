namespace Movilizacion.Models
{
    public class Contact
    {
        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Gets or sets the image
        /// </summary>
        public string Image { get; set; }
        /// <summary>
        /// Gets or sets the emails
        /// </summary>
        public string Email { get; set; }
        /// <summary>
        /// Gets or sets the phone numbers
        /// </summary>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Gets or sets the image
        /// </summary>
        public string ImageFull => Image == null
            ? $"noimage.png"
            : $"{Image}";

        public string[] Emails { get; set; }
        /// <summary>
        /// Gets or sets the phone numbers
        /// </summary>
        public string[] PhoneNumbers { get; set; }
    }
}
