using System;
using System.Linq;

namespace Elecciones.Common.Helpers
{
    public class GenerateCode
    {
        public string CodeValidation { get; set; }

        public GenerateCode(int lenght)
        {
            CodeValidation = $"{RandomString(lenght)}{RandomNumber(lenght)}";
        }

        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[new Random().Next(s.Length)]).ToArray());
        }

        public static string RandomNumber(int length)
        {
            const string chars = "0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[new Random().Next(s.Length)]).ToArray());
        }
    }
}
