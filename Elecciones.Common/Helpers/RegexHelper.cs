using System;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Elecciones.Common.Helpers
{
    public class RegexHelper
    {
        public bool IsValidEmail(string emailaddress)
        {
            try
            {
                new MailAddress(emailaddress);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public bool ValidatePassword(string input, out string ErrorMessage)
        {
            bool flag = true;
            ErrorMessage = string.Empty;
            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasMiniMaxChars = new Regex(@".{8,15}");
            var hasLowerChar = new Regex(@"[a-z]+");
            //var hasSymbols = new Regex(@"[!@#$%^&*()_+=\[{\]};:<>|./?,-]");

            if (string.IsNullOrWhiteSpace(input))
            {
                ErrorMessage = "Debe ingresar una contraseña.";
                return false;
            }
            ErrorMessage = "La contraseña debe de contener al menos: \n";

            if (!hasLowerChar.IsMatch(input))
            {
                ErrorMessage += "-Una letra minúscula.\n";
                flag = false;
            }

            if (!hasUpperChar.IsMatch(input))
            {
                ErrorMessage += "-Una letra mayúscula.\n";
                flag = false;
            }
            
            if (!hasNumber.IsMatch(input))
            {
                ErrorMessage += "-Un número.\n";
                flag = false;
            }
            
            if (!hasMiniMaxChars.IsMatch(input))
            {
                ErrorMessage += "-8 caracteres.";
                flag = false;
            }
            //else if (!hasSymbols.IsMatch(input))
            //{
            //    ErrorMessage = "La contraseña debe contener al menos un caracter especial.";
            //    return false;
            //}
            return !flag ? false : true;
        }

        public bool ValidateUrl(string url)
        {
            Regex urlValidation = new Regex(@"((file|gopher|news|nntp|telnet|http|ftp|https|ftps|sftp)://)+(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,15})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(/[a-zA-Z0-9\&amp;%_\./-~-]*)?", RegexOptions.Singleline | RegexOptions.IgnoreCase);

            return urlValidation.IsMatch(url) ? true : false;
        }

        public bool RegexCURP(string curp)
        {
            var re = @"^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$";
            Regex rx = new Regex(re, RegexOptions.Compiled | RegexOptions.IgnoreCase);
            return rx.IsMatch(curp);
        }

        public bool RegexClaveElector(string claveElector)
        {
            var re = @"^([A-Z]{6}[0-9]{8}[A-Z]{1}[0-9]{3})";
            Regex rx = new Regex(re, RegexOptions.Compiled | RegexOptions.IgnoreCase);
            return rx.IsMatch(claveElector.ToUpper());
        }

        public bool RegexCIC(string cic)
        {
            var re = @"^([A-Z]{5}[0-9]{10}[<]{2}[0-9]{13})";
            Regex rx = new Regex(re, RegexOptions.Compiled | RegexOptions.IgnoreCase);
            return rx.IsMatch(cic.ToUpper());
        }
    }
}
