using Elecciones.Common.Responses;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Configuration;

namespace Elecciones.Logic.Helpers
{
    public class MailHelper
    {
        public Response SendMail(string to, string subject, string body)
        {
            try
            {
                string from = ConfigurationManager.AppSettings["MailFrom"];
                string smtp = ConfigurationManager.AppSettings["MailSmtp"];
                string port = ConfigurationManager.AppSettings["MailPort"];
                string password = ConfigurationManager.AppSettings["MailPassword"];

                MimeMessage message = new MimeMessage();
                message.From.Add(new MailboxAddress("Emisor", from));
                message.To.Add(new MailboxAddress("Remitente", to));
                message.Subject = subject;
                BodyBuilder bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };
                message.Body = bodyBuilder.ToMessageBody();

                using (SmtpClient client = new SmtpClient())
                {
                    client.Connect(smtp, int.Parse(port), false);
                    client.Authenticate(from, password);
                    client.Send(message);
                    client.Disconnect(true);
                }

                return new Response { IsSuccess = true };

            }
            catch (Exception ex)
            {
                return new Response
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Result = ex
                };
            }
        }
    }
}
