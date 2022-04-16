using Azure;
using Azure.AI.FormRecognizer;
using Azure.AI.FormRecognizer.Models;
using Azure.AI.FormRecognizer.Training;
using Elecciones.Common.Helpers;
using Elecciones.Common.Models;
using Elecciones.Common.Requests;
using Elecciones.Logic.Business;
using Elecciones.Logic.Deteccion;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Elecciones.Logic.Services
{
    public class FormRecognizerService
    {
        private string messageError; 
        private RegexHelper _regexHelper;

        public FormRecognizerService()
        {
            _regexHelper = new RegexHelper();
        }

        #region [ Authenticate ]
        private FormRecognizerClient AuthenticateClient()
        {
            string endpoint = GlobalConstants.EndpointCognitiveService;
            string apiKey = GlobalConstants.KeyCognitiveService;
            var credential = new AzureKeyCredential(apiKey);
            var client = new FormRecognizerClient(new Uri(endpoint), credential);
            return client;
        }
        #endregion [ Authenticate ]

        public async Task<(CredentialTypeC credential, string message)> RecognizeContentTypeC(CredentialRequest credentialRequest, bool countError = true)
        {
            CredentialTypeC credential = new CredentialTypeC();
            CredentialTypeC credential1 = new CredentialTypeC();
            List<Task<CredentialTypeC>> tasks = new List<Task<CredentialTypeC>>();

            try
            {
                var credentialTask = RecognizeProcessC(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontC1);
                tasks.Add(credentialTask);
                var credential1Task = RecognizeProcessC(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontC);
                tasks.Add(credential1Task);
                var creadentialBackTask = RecognizeProcessBackC(credentialRequest.ImageBack, GlobalConstants.ModelIdBackC);
                tasks.Add(creadentialBackTask);

                CredentialTypeC[] respuestas = await Task.WhenAll(tasks);

                credential = respuestas[0];
                if (credential == null)
                    return (null, messageError);

                credential1 = respuestas[1];
                if (credential1 == null)
                    return (null, messageError);

                if (respuestas[2] == null)
                    return (null, messageError);

                credential.OCR = respuestas[2].OCR;
                credential1.OCR = respuestas[2].OCR;

                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        foreach (PropertyInfo property1 in credential1.GetType().GetProperties())
                            if (property.Name == property1.Name)
                                property.SetValue(credential, property1.GetValue(credential1, null));

                var (boolClaveElector, claveElector) = ValidateClaveElector(credential.ClaveElector, credential1.ClaveElector);

                if (!boolClaveElector)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Clave de Elector es ilegible");

                credential.ClaveElector = claveElector;

                var (boolTextName, textName) = ValidateTextName(credential.Nombre, credential1.Nombre, credential.ClaveElector, 4);
                if (!boolTextName)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Nombre es ilegible");
                
                credential.Nombre = textName;

                var (boolTextPaterno, textPaterno) = ValidateTextName(credential.ApellidoPaterno, credential1.ApellidoPaterno, credential.ClaveElector, 0);
                if (!boolTextPaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Paterno es ilegible");
                
                credential.ApellidoPaterno = textPaterno;

                var (boolTextMaterno, textMaterno) = ValidateTextName(credential.ApellidoMaterno, credential1.ApellidoMaterno, credential.ClaveElector, 2);
                if (!boolTextMaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Materno es ilegible");
                
                credential.ApellidoMaterno = textMaterno;

                var (boolCURP, CURP) = ValidateCURP(credential.CURP, credential1.CURP);
                credential.CURP = CURP;

                if (string.IsNullOrEmpty(credential.Calle) && string.IsNullOrEmpty(credential1.Calle))
                {
                }
                else
                {
                    //if ((string.IsNullOrEmpty(credential.Calle) && credential1.Calle != string.Empty) || (string.IsNullOrEmpty(credential1.Calle) && credential.Calle != string.Empty))
                    if (string.IsNullOrEmpty(credential.Calle) || string.IsNullOrEmpty(credential1.Calle))
                        credential.Calle = string.Empty;
                    //throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Calle es ilegible");
                }

                if (string.IsNullOrEmpty(credential.OCR))
                    throw new Exception("Vuelva a enviar la parte de atrás de la credencial del INE");

                var section = await new Sections().GetSection(int.Parse(credential.Seccion), int.Parse(credential.NoEstado));

                if (section == null)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                if (string.IsNullOrEmpty(credential.Seccion))
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                int i = 0;

                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        i++;

                if (string.IsNullOrEmpty(credential.Calle))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoPaterno))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoMaterno))
                    i--;

                if (countError)
                {
                    if (i >= 1)
                        throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE"); 
                }

                return (credential, string.Empty);
            }
            catch (Exception ex)
            {
                return (null, ex.Message);
            }
        }

        public async Task<(CredentialTypeDEF credential, string message)> RecognizeContentTypeDEF(CredentialRequest credentialRequest, bool countError = true)
        {
            CredentialTypeDEF credential = new CredentialTypeDEF();
            CredentialTypeDEF credential1 = new CredentialTypeDEF();
            List<Task<CredentialTypeDEF>> tasks = new List<Task<CredentialTypeDEF>>();
            try
            {
                var credentialTask = RecognizeProcessDEF(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontDEF1);
                tasks.Add(credentialTask);
                var credential1Task = RecognizeProcessDEF(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontDEF);
                tasks.Add(credential1Task);
                var creadentialBackTask = RecognizeProcessBackDEF(credentialRequest.ImageBack, GlobalConstants.ModelIdBackDEF);
                tasks.Add(creadentialBackTask);

                CredentialTypeDEF[] respuestas = await Task.WhenAll(tasks);

                credential = respuestas[0];
                if (credential == null)
                    return (null, messageError);

                credential1 = respuestas[1];
                if (credential1 == null)
                    return (null, messageError);

                if (respuestas[2] == null)
                    return (null, messageError);

                credential.CIC = respuestas[2].CIC;
                credential.ZonaLecturaMecanica = respuestas[2].ZonaLecturaMecanica;
                credential1.CIC = respuestas[2].CIC;
                credential1.ZonaLecturaMecanica = respuestas[2].ZonaLecturaMecanica;

                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        foreach (PropertyInfo property1 in credential1.GetType().GetProperties())
                            if (property.Name == property1.Name)
                                property.SetValue(credential, property1.GetValue(credential1, null));

                var(boolClaveElector, claveElector) = ValidateClaveElector(credential.ClaveElector, credential1.ClaveElector);

                if(!boolClaveElector)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Clave de Elector es ilegible");

                credential.ClaveElector = claveElector;
                var (boolTextName, textName) = ValidateTextName(credential.Nombre, credential1.Nombre, credential.ClaveElector, 4);
                if (!boolTextName)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Nombre es ilegible");

                credential.Nombre = textName;

                var (boolTextPaterno, textPaterno) = ValidateTextName(credential.ApellidoPaterno, credential1.ApellidoPaterno, credential.ClaveElector, 0);
                if (!boolTextPaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Paterno es ilegible");

                credential.ApellidoPaterno = textPaterno;

                var (boolTextMaterno, textMaterno) = ValidateTextName(credential.ApellidoMaterno, credential1.ApellidoMaterno, credential.ClaveElector, 2);
                if (!boolTextMaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Materno es ilegible");

                credential.ApellidoMaterno = textMaterno;

                var (boolCIC, CIC) = ValidateCIC(credential.CIC, credential1.CIC);

                if (!boolCIC)
                    throw new Exception("Vuelva a enviar la parte de atrás de la credencial del INE");

                credential.CIC = CIC;

                var (boolCURP, CURP) = ValidateCURP(credential.CURP, credential1.CURP);
                credential.CURP = CURP;

                if (string.IsNullOrEmpty(credential.Calle) && string.IsNullOrEmpty(credential1.Calle))
                {
                }
                else
                {
                    //if ((string.IsNullOrEmpty(credential.Calle) && credential1.Calle != string.Empty) || (string.IsNullOrEmpty(credential1.Calle) && credential.Calle != string.Empty))
                    if (string.IsNullOrEmpty(credential.Calle) || string.IsNullOrEmpty(credential1.Calle))
                        credential.Calle = string.Empty;
                    //throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Calle es ilegible");
                }

                var section = await new Sections().GetSection(int.Parse(credential.Seccion), int.Parse(credential.NoEstado));

                if (section == null)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                if (string.IsNullOrEmpty(credential.Seccion))
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                int i = 0;
                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        i++;

                if (string.IsNullOrEmpty(credential.Calle))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoPaterno))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoMaterno))
                    i--;

                if (countError)
                {
                    if (i >= 1)
                        throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE"); 
                }

                return (credential, string.Empty);
            }
            catch (Exception ex)
            {
                return (null, ex.Message);
            }
        }

        public async Task<(CredentialTypeGH credential, string message)> RecognizeContentTypeGH(CredentialRequest credentialRequest, bool countError = true)
        {
            CredentialTypeGH credential = new CredentialTypeGH();
            CredentialTypeGH credential1 = new CredentialTypeGH();
            List<Task<CredentialTypeGH>> tasks = new List<Task<CredentialTypeGH>>();

            try
            {
                var credentialTask = RecognizeProcessGH(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontGH);
                tasks.Add(credentialTask);
                var credential1Task = RecognizeProcessGH(credentialRequest.ImageFront, GlobalConstants.ModelIdFrontGH1);
                tasks.Add(credential1Task);
                var creadentialBackTask = RecognizeProcessBackGH(credentialRequest.ImageBack, GlobalConstants.ModelIdBackGH);
                tasks.Add(creadentialBackTask);

                CredentialTypeGH[] respuestas = await Task.WhenAll(tasks);

                credential = respuestas[0];
                if (credential == null)
                    return (null, messageError);

                credential1 = respuestas[1];
                if (credential1 == null)
                    return (null, messageError);

                if (respuestas[2] == null)
                    return (null, messageError);

                credential.CIC = respuestas[2].CIC;
                credential.ZonaLecturaMecanica = respuestas[2].ZonaLecturaMecanica;
                credential1.CIC = respuestas[2].CIC;
                credential1.ZonaLecturaMecanica = respuestas[2].ZonaLecturaMecanica;

                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        foreach (PropertyInfo property1 in credential1.GetType().GetProperties())
                            if (property.Name == property1.Name)
                                property.SetValue(credential, property1.GetValue(credential1, null));

                var (boolClaveElector, claveElector) = ValidateClaveElector(credential.ClaveElector, credential1.ClaveElector);

                if (!boolClaveElector)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Clave de Elector es ilegible");

                credential.ClaveElector = claveElector;

                var (boolTextName, textName) = ValidateTextName(credential.Nombre, credential1.Nombre, credential.ClaveElector, 4);
                if (!boolTextName)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Nombre es ilegible");

                credential.Nombre = textName;

                var (boolTextPaterno, textPaterno) = ValidateTextName(credential.ApellidoPaterno, credential1.ApellidoPaterno, credential.ClaveElector, 0);
                if (!boolTextPaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Paterno es ilegible");

                credential.ApellidoPaterno = textPaterno;

                var (boolTextMaterno, textMaterno) = ValidateTextName(credential.ApellidoMaterno, credential1.ApellidoMaterno, credential.ClaveElector, 2);
                if (!boolTextMaterno)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nEl Apellido Materno es ilegible");

                credential.ApellidoMaterno = textMaterno;

                var (boolCIC, CIC) = ValidateCIC(credential.CIC, credential1.CIC);

                if (!boolCIC)
                    throw new Exception("Vuelva a enviar la parte de atrás de la credencial del INE");

                credential.CIC = CIC;

                var (boolCURP, CURP) = ValidateCURP(credential.CURP, credential1.CURP);
                credential.CURP = CURP;

                if (string.IsNullOrEmpty(credential.Calle) && string.IsNullOrEmpty(credential1.Calle))
                {
                }
                else
                {
                    //if ((string.IsNullOrEmpty(credential.Calle) && credential1.Calle != string.Empty) || (string.IsNullOrEmpty(credential1.Calle) && credential.Calle != string.Empty))
                    if (string.IsNullOrEmpty(credential.Calle) || string.IsNullOrEmpty(credential1.Calle))
                        credential.Calle = string.Empty;
                        //throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE\nLa Calle es ilegible");
                }

                var section = await new Sections().GetSection(int.Parse(credential.Seccion));
                
                if (section == null)
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                if (string.IsNullOrEmpty(credential.Seccion))
                    throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE");

                int i = 0;
                foreach (PropertyInfo property in credential.GetType().GetProperties())
                    if (property.GetValue(credential, null) == null)
                        i++;

                if (string.IsNullOrEmpty(credential.Calle))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoPaterno))
                    i--;

                if (string.IsNullOrEmpty(credential.ApellidoMaterno))
                    i--;

                if (countError)
                {
                    if (i >= 1)
                        throw new Exception("Vuelva a enviar la parte del frente de la credencial del INE"); 
                }

                return (credential, string.Empty);
            }
            catch (Exception ex)
            {
                return (null, ex.Message);
            }
        }

        
        private async Task<CredentialTypeC> RecognizeProcessC(byte[] imageFront, string modelIdFront)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeC credential = new CredentialTypeC();
            try
            {
                Stream stream = new MemoryStream(imageFront);
                RecognizedFormCollection formsFront = await recognizeClient.StartRecognizeCustomForms(modelIdFront, stream).WaitForCompletionAsync();
                PropertyInfo[] lst = typeof(CredentialTypeC).GetProperties();

                foreach (RecognizedForm form in formsFront)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                            foreach (PropertyInfo property in lst)
                                if (field.Name == property.Name)
                                    property.SetValue(credential, field.ValueData.Text.Trim());

                credential.CP = credential.CP == null ? null : string.Join(null, Regex.Split(credential.CP, "[^\\d]"));
                credential.AñoRegistro = credential.AñoRegistro == null ? null : string.Join(null, Regex.Split(credential.AñoRegistro, "[^\\d]"));
                credential.NumEmision = credential.NumEmision == null ? null : string.Join(null, Regex.Split(credential.NumEmision, "[^\\d]"));
                credential.NoEstado = credential.NoEstado == null ? null : string.Join(null, Regex.Split(credential.NoEstado, "[^\\d]"));
                credential.NoMunicipio = credential.NoMunicipio == null ? null : string.Join(null, Regex.Split(credential.NoMunicipio, "[^\\d]"));
                credential.Localidad = credential.Localidad == null ? null : string.Join(null, Regex.Split(credential.Localidad, "[^\\d]"));
                credential.Seccion = credential.Seccion == null ? null : string.Join(null, Regex.Split(credential.Seccion, "[^\\d]"));
                credential.Emision = credential.Emision == null ? null : string.Join(null, Regex.Split(credential.Emision, "[^\\d]"));
                credential.Vigencia = credential.Vigencia == null ? null : string.Join(null, Regex.Split(credential.Vigencia, "[^\\d]"));
                
                credential.ClaveElector = credential.ClaveElector == null ? null : credential.ClaveElector.Replace(" ", string.Empty);
                credential.CURP = credential.CURP == null ? null : credential.CURP.Replace(" ", string.Empty);

                return (credential);
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        private async Task<CredentialTypeDEF> RecognizeProcessDEF(byte[] imageFront, string modelIdFront)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeDEF credential = new CredentialTypeDEF();
            try
            {
                Stream stream = new MemoryStream(imageFront);
                RecognizedFormCollection formsFront = await recognizeClient.StartRecognizeCustomForms(modelIdFront, stream).WaitForCompletionAsync();
                PropertyInfo[] lst = typeof(CredentialTypeDEF).GetProperties();

                foreach (RecognizedForm form in formsFront)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                            foreach (PropertyInfo property in lst)
                                if (field.Name == property.Name)
                                    property.SetValue(credential, field.ValueData.Text.Trim());

                credential.CP = credential.CP == null ? null : string.Join(null, Regex.Split(credential.CP, "[^\\d]"));
                credential.AñoRegistro = credential.AñoRegistro == null ? null : string.Join(null, Regex.Split(credential.AñoRegistro, "[^\\d]"));
                credential.NumEmision = credential.NumEmision == null ? null : string.Join(null, Regex.Split(credential.NumEmision, "[^\\d]"));
                credential.NoEstado = credential.NoEstado == null ? null : string.Join(null, Regex.Split(credential.NoEstado, "[^\\d]"));
                credential.NoMunicipio = credential.NoMunicipio == null ? null : string.Join(null, Regex.Split(credential.NoMunicipio, "[^\\d]"));
                credential.Seccion = credential.Seccion == null ? null : string.Join(null, Regex.Split(credential.Seccion, "[^\\d]"));
                credential.Localidad = credential.Localidad == null ? null : string.Join(null, Regex.Split(credential.Localidad, "[^\\d]"));
                credential.Emision = credential.Emision == null ? null : string.Join(null, Regex.Split(credential.Emision, "[^\\d]"));
                credential.Vigencia = credential.Vigencia == null ? null : string.Join(null, Regex.Split(credential.Vigencia, "[^\\d]"));

                credential.ClaveElector = credential.ClaveElector == null ? null : credential.ClaveElector.Replace(" ", string.Empty);
                credential.CURP = credential.CURP == null ? null : credential.CURP.Replace(" ", string.Empty);

                return credential;
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        private async Task<CredentialTypeGH> RecognizeProcessGH(byte[] imageFront, string modelIdFront)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeGH credential = new CredentialTypeGH();

            try
            {
                Stream stream = new MemoryStream(imageFront);
                RecognizedFormCollection formsFront = await recognizeClient.StartRecognizeCustomForms(modelIdFront, stream).WaitForCompletionAsync();
                PropertyInfo[] lst = typeof(CredentialTypeGH).GetProperties();

                foreach (RecognizedForm form in formsFront)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                            foreach (PropertyInfo property in lst)
                                if (field.Name == property.Name)
                                    property.SetValue(credential, field.ValueData.Text.Trim());

                credential.CP = credential.CP == null ? null : string.Join(null, Regex.Split(credential.CP, "[^\\d]"));
                credential.AñoRegistro = credential.AñoRegistro == null ? null : string.Join(null, Regex.Split(credential.AñoRegistro, "[^\\d]"));
                credential.NumEmision = credential.NumEmision == null ? null : string.Join(null, Regex.Split(credential.NumEmision, "[^\\d]"));
                credential.Seccion = credential.Seccion == null ? null : string.Join(null, Regex.Split(credential.Seccion, "[^\\d]"));
                credential.Emision = credential.Emision.Replace(" ", string.Empty);
                string[] emision_vigencia = credential.Emision == null ? new string[0] : credential.Emision.Split('-');
                if (emision_vigencia.Length == 2)
                {
                    credential.Emision = string.Join(null, Regex.Split(emision_vigencia[0], "[^\\d]"));
                    credential.Vigencia = string.Join(null, Regex.Split(emision_vigencia[1], "[^\\d]"));
                }

                credential.ClaveElector = credential.ClaveElector == null ? null : credential.ClaveElector.Replace(" ", string.Empty);
                credential.CURP = credential.CURP == null ? null : credential.CURP.Replace(" ", string.Empty);

                return credential;
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        private async Task<CredentialTypeC> RecognizeProcessBackC(byte[] imageBack, string modelIdBack)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeC credential = new CredentialTypeC();

            try
            {
                Stream stream = new MemoryStream(imageBack);
                RecognizedFormCollection formsBack = await recognizeClient.StartRecognizeCustomForms(modelIdBack, stream).WaitForCompletionAsync();

                foreach (RecognizedForm form in formsBack)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                            if (field.Name.Equals(nameof(credential.OCR)))
                            {
                                var isNumber = field.ValueData.Text.Replace(" ", string.Empty).Trim().All(char.IsDigit);
                                if (isNumber && field.ValueData.Text.Replace(" ", string.Empty).Trim().Length == 13)
                                    credential.OCR = field.ValueData.Text.Replace(" ", string.Empty).Trim();
                                else
                                    throw new Exception("Vuelva a enviar la parte de atrás de la credencial del INE");
                            }

                return credential;
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        private async Task<CredentialTypeDEF> RecognizeProcessBackDEF(byte[] imageBack, string modelIdBack)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeDEF credential = new CredentialTypeDEF();

            try
            {
                Stream stream = new MemoryStream(imageBack);
                RecognizedFormCollection formsBack = await recognizeClient.StartRecognizeCustomForms(modelIdBack, stream).WaitForCompletionAsync();

                foreach (RecognizedForm form in formsBack)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                        {
                            if (field.Name.Equals(nameof(credential.CIC)))
                                credential.CIC = field.ValueData.Text.Replace(" ", string.Empty).Trim();

                            if (field.Name.Equals(nameof(credential.ZonaLecturaMecanica)))
                                credential.ZonaLecturaMecanica = field.ValueData.Text.Replace(" ", string.Empty).Trim();
                        }
                return credential;
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        private async Task<CredentialTypeGH> RecognizeProcessBackGH(byte[] imageBack, string modelIdBack)
        {
            FormRecognizerClient recognizeClient = AuthenticateClient();
            CredentialTypeGH credential = new CredentialTypeGH();

            try
            {
                Stream stream = new MemoryStream(imageBack);
                RecognizedFormCollection formsBack = await recognizeClient.StartRecognizeCustomForms(modelIdBack, stream).WaitForCompletionAsync();

                foreach (RecognizedForm form in formsBack)
                    foreach (FormField field in form.Fields.Values)
                        if (field != null)
                        {
                            if (field.Name.Equals(nameof(credential.CIC)))
                                credential.CIC = field.ValueData.Text.Replace(" ", string.Empty).Trim();

                            if (field.Name.Equals(nameof(credential.ZonaLecturaMecanica)))
                                credential.ZonaLecturaMecanica = field.ValueData.Text.Replace(" ", string.Empty).Trim();
                        }

                return credential;
            }
            catch (Exception ex)
            {
                messageError = ex.Message;
                return null;
            }
        }

        #region [ Helpers ]
        private (bool, string) ValidateClaveElector(string claveElector, string claveElector1)
        {
            int[] positions = new int[] { 6, 13, 15, 17 };
            int length = 18;
            string _claveElector = string.Empty;
            if (claveElector.Length < length && claveElector1.Length < length)
                return (false, string.Empty);

            if (claveElector.Length == length)
            {
                _claveElector = ReplaceOTo0(claveElector, positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);
            }

            if (claveElector1.Length == length)
            {
                _claveElector = ReplaceOTo0(claveElector1, positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);
            }

            if (claveElector.Length > length)
            {
                _claveElector = ReplaceOTo0(claveElector.Substring(0, length), positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);

                _claveElector = ReplaceOTo0(claveElector.Substring(claveElector.Length - length, length), positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);
            }

            if (claveElector1.Length > length)
            {
                _claveElector = ReplaceOTo0(claveElector1.Substring(0, length), positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);

                _claveElector = ReplaceOTo0(claveElector1.Substring(claveElector1.Length - length, length), positions);
                if (_regexHelper.RegexClaveElector(_claveElector))
                    return (true, _claveElector);
            }

            return (false, string.Empty);
        }

        private (bool, string) ValidateCURP(string curp, string curp1)
        {
            int[] positions = new int[] { 4, 9, 16, 17 };
            int length = 18;
            string _curp = string.Empty;
            if (curp.Length < length && curp1.Length < length)
                return (false, string.Empty);

            if (curp.Length == length)
            {
                _curp = ReplaceOTo0(curp, positions);
                //if (_regexHelper.RegexCURP(_curp))
                return (true, _curp);
            }

            if (curp1.Length == length)
            {
                _curp = ReplaceOTo0(curp1, positions);
                //if (_regexHelper.RegexCURP(_curp))
                return (true, _curp);
            }

            if (curp.Length > length)
            {
                //_curp = ReplaceOTo0(curp.Substring(0, length), positions);
                //if (_regexHelper.RegexCURP(_curp))
                //    return (true, _curp);

                _curp = ReplaceOTo0(curp.Substring(curp.Length - length, length), positions);
                //if (_regexHelper.RegexCURP(_curp))
                return (true, _curp);
            }

            if (curp1.Length > length)
            {
                //_curp = ReplaceOTo0(curp1.Substring(0, length), positions);
                //if (_regexHelper.RegexCURP(_curp))
                //    return (true, _curp);

                _curp = ReplaceOTo0(curp1.Substring(curp1.Length - length, length), positions);
                //if (_regexHelper.RegexCURP(_curp))
                return (true, _curp);
            }

            return (false, string.Empty);
        }

        private (bool, string) ValidateCIC(string cic, string cic1)
        {
            int[] positions = new int[] { 4, 9, 16, 17 };
            int length = 30;
            string _cic = string.Empty;

            if (string.IsNullOrEmpty(cic) && string.IsNullOrEmpty(cic1))
                return (false, string.Empty);

            if (cic.Length < length && cic1.Length < length)
                return (false, string.Empty);

            if (cic.Length == length)
            {
                _cic = ReplaceOTo0(cic, positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);
            }

            if (cic1.Length == length)
            {
                _cic = ReplaceOTo0(cic1, positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);
            }

            if (cic.Length > length)
            {
                _cic = ReplaceOTo0(cic.Substring(0, length), positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);

                _cic = ReplaceOTo0(cic.Substring(cic.Length - length, length), positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);
            }

            if (cic1.Length > length)
            {
                _cic = ReplaceOTo0(cic1.Substring(0, length), positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);

                _cic = ReplaceOTo0(cic1.Substring(cic1.Length - length, length), positions);
                if (_regexHelper.RegexCIC(_cic))
                    return (true, _cic);
            }

            return (false, string.Empty);
        }

        private static (bool, string) ValidateTextName(string textName, string textName1, string claveElector, int initialPosition)
        {
            try
            {
                string letterTextName = string.Empty;
                string letterTextName1 = string.Empty;

                string letterClaveElector = claveElector.Substring(initialPosition, 1);

                if (letterClaveElector.ToUpper() == "X")
                    if (claveElector.Substring(initialPosition, 2) == "XX")
                        return (true, string.Empty);

                if (textName == null && textName1 == null)
                    return (false, string.Empty);

                letterTextName = textName.Substring(0, 1);
                letterTextName1 = textName1.Substring(0, 1);

                if (letterClaveElector == letterTextName && letterClaveElector == letterTextName1)
                    return (true, textName);

                if (letterClaveElector == letterTextName)
                    return (true, textName);

                if (letterClaveElector == letterTextName1)
                    return (true, textName1);


                string[] words = textName.Split(' ');

                foreach (string word in words)
                    if (word.Substring(0, 1) == letterClaveElector)
                        return (true, textName);

                string[] words1 = textName1.Split(' ');

                foreach (string word in words1)
                    if (word.Substring(0, 1) == letterClaveElector)
                        return (true, textName1);

                return (false, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        private string ReplaceOTo0(string text, int[] positions)
        {
            int position = 0;
            foreach (var character in text.ToUpper())
            {
                switch (position)
                {
                    case int n when ((n >= positions[0] && n <= positions[1]) || (n >= positions[2] && n <= positions[3])):
                        if (char.IsLetter(character))
                            if (character == 'O')
                                text = text.Remove(position, 1).Insert(position, "0");
                        break;
                    default:
                        break;
                }
                position++;
            }
            return text;
        }
        #endregion
    }
}
