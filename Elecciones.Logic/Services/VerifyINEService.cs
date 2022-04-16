using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elecciones.Logic.Services
{
    //public class VerifyINEService
    //{
    //    public DataResponse VerifyData(DatosCiudadano datos, VerificacionDatosClient.Ubicacion ubicacion, Guid indiceIne)
    //    {
    //        var client = new ServiceClient();
    //        var verify = new DatosConsulta
    //        {
    //            consentimiento = true,
    //            minucias = null,
    //            datos = datos,
    //            ubicacion = ubicacion,
    //            timeStamp = new TimeStamp { indice = indiceIne.ToString() }
    //        };
    //        var response = client.VerificacionDatos(verify);
    //        return response.response.dataResponse;
    //    }

    //    public MinutiaeResponse VerifyMinutiae(DatosCiudadano datos, Minucias minucias, VerificacionDatosClient.Ubicacion ubicacion, Guid indiceIne)
    //    {
    //        var client = new ServiceClient();
    //        var verify = new DatosConsulta
    //        {
    //            consentimiento = true,
    //            minucias = minucias,
    //            datos = datos,
    //            ubicacion = ubicacion,
    //            timeStamp = new TimeStamp { indice = indiceIne.ToString() }
    //        };
    //        var response = client.VerificacionDatos(verify);

    //        return response.response.minutiaeResponse;
    //    }

    //    private string GetRespuesta(int codigoRespuesta)
    //    {
    //        switch (codigoRespuesta)
    //        {
    //            case 1001: return "Parámetros incompletos: Sin OCR, Clave de Elector y número de emisión o CIC";
    //            case 1002: return "Nombre del ciudadano es inválido";
    //            case 1003: return "Apellido Paterno del ciudadano es inválido";
    //            case 1004: return "Apellido Materno del ciudadano es inválido";
    //            case 1005: return "Año de Registro del ciudadano es inválido";
    //            case 1006: return "Año de Emisión del ciudadano es inválido";
    //            case 1007: return "CURP del ciudadano es inválido";
    //            case 1008: return "Consentimiento No otorgado por el ciudadano para emplear sus datos en la verificación";
    //            case 1009: return "El tipo de imagen no fue indicado (WSQ, ANSI o RAW)";
    //            case 1010: return "El Ancho y el Alto de la imagen es inválido debe ser un valor Null";
    //            case 1011: return "El Ancho y el Alto de la imagen es inválido debe ser un valor de 416 px";
    //            case 1012: return "Se requiere al menos una huella digital sea el índice izquierdo o el derecho";
    //            case 1013: return "Se requiere al menos un atributo del nodo de Ubicación";
    //            case 1014: return "Parámetro de Latitud es inválido";
    //            case 1015: return "Parámetro de Longitud es inválido";
    //            case 1016: return "El código postal es inválido no pertenece a ninguna localidad";
    //            case 1017: return "Nombre de la Ciudad es inválido";
    //            case 1018: return "El Estado ingresado no pertenece al catálogo de la Entidades Federativas";
    //            case 1019: return "Estampa de tiempo es inválido o nulo";
    //            case 1020: return "Índice de la estampa de tiempo es inválida o nulo";
    //            case 1021: return "No se puede establecer conexión en el HSM";
    //            case 1022: return "No se puede iniciar sesión: Autenticación fallida datos inválidos";
    //            case 1023: return "Error durante la encriptación de la información";
    //            case 1024: return "Error al realizar la firma digital";
    //            case 1500: return "Excepción no controlada";
    //            case 1501: return "Alcanzo en número de peticiones permitidos";
    //            default: return "Error desconocido";
    //        }
    //    }
    //}

    //public enum TipoMunicia
    //{
    //    ANSI = 1,
    //    WSQ = 2,
    //    RAW = 3
    //}
}
