using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Xsl;

namespace Elecciones.Logic.Tools
{
    public static class EmailSender
    {
        public static string[] EmailTo { get; set; }
        public static string[] EmailBcc { get; set; }
        public static string Subject { get; set; }
        public static string XmlMessage { get; set; }
        public static string XslMessage { get; set; }
        private static MailAddress From => new MailAddress("sirc@bvir2al.com", "MyDecMov");

        public static void Send()
        {
            try
            {
                var message = new MailMessage
                {
                    From = From,
                    Priority = MailPriority.Normal,
                    IsBodyHtml = true,
                    Subject = Subject
                };
                SetToList(message);
                SetMessage(message);

                using (var client = new SmtpClient())
                {
                    client.EnableSsl = true;
                    client.Send(message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR. EmailSender" + ex.Message);
            }
        }

        private static void SetToList(MailMessage message)
        {
            foreach (var to in EmailTo)
            {
                if (!Regex.IsMatch(to.Trim(), @"\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\Z",
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250))) return;
                var mail = new MailAddress(to);
                if (message.To.Contains(mail)) return;
                message.To.Add(mail);
            }
            if (EmailBcc != null)
                foreach (var bcc in EmailBcc)
                {
                    if (!Regex.IsMatch(bcc.Trim(), @"\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\Z",
                    RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250))) continue;
                    var mail = new MailAddress(bcc);
                    if (message.Bcc.Contains(mail)) continue;
                    message.Bcc.Add(mail);
                }
        }

        private static void SetMessage(MailMessage message)
        {
            var doc = new XmlDocument();
            doc.LoadXml(XmlMessage);

            var parameters = new Dictionary<string, string>();
            var ctrl = TransformXMLString(doc, XslMessage, parameters);

            message.Body = ctrl;
            message.IsBodyHtml = true;
        }

        private static string TransformXMLString(XmlDocument xml, string xslt, Dictionary<string, string> parameters)
        {
            var xsl = new XslCompiledTransform();
            var xslarg = new XsltArgumentList();
            foreach (var p in parameters)
            {
                xslarg.AddParam(p.Key, "", p.Value);
            }
            var sw = new StringWriter();

            xsl.Load(xslt);

            xsl.Transform(xml, xslarg, sw);
            var result = sw.ToString().Replace("xmlns:asp=\"remove\"", "");
            sw.Close();
            return result;
        }

    }
}
