const year = new Date().getFullYear();

const newPetRegister = async (petName, petSpecie) => {
  const emailBody = `
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Tu mascota ${petName} se ha registrado correctamente</title>
</head>
<body style="background-color: #ffffff; font-family: 'Caveat', Arial; color: #4d82bc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="background-color: #005187; padding: 20px;">
                <h1 style="color: #ffffff; font-size: 24px; font-family: 'Caveat', Arial; margin: 0;">¡${petName} está disponible para ser adoptado! </h1>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    ¡Te agradecemos mucho la confianza depositada en nosotros! Y poder permitirnos encontrarle un hogar con mucho amor a ${petName}!. Para nosotros es un honor colaborar con organizaciones dedicadas al bienestar animal.
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Nos tomamos muy enserio nuestro compromiso del bienestar de las mascotas, tratando de que el proceso de adopción sea lo más seguro posible entre usuarios y protectoras.
                </p>
 
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    ¡Esperamos poder encontrarle una nueva familia a ${petName} muy pronto! Ya puede ser localizado en la categoría ${petSpecie}
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Os mantendremos informados de cada solicitante, para que podáis evaluar cada solicitud.
                </p>
      
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Para cualquier duda o información que necesiteis os facilitamos nuestro contacto:
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    (FUTUROS DATOS DE CONTACTO)
                </p>
            </td>
        </tr>
        <tr>
            <td align="center">
                <img src="cid:unique@logo.cid" style="width:100px;height:auto;">
            </td>
        </tr>
        <tr>
            <td align="center" style="background-color: #957698; color: #ffffff; padding: 10px;">
                <p style="font-size: 14px; font-family: 'Caveat', Arial; margin: 0;">
                    SpotMyPet © ${year}. Todos los derechos reservados.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
  return emailBody;
};

module.exports = newPetRegister;
