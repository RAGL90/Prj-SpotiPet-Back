const year = new Date().getFullYear();

const newPetRegister = async (userName, petName, ownerName) => {
  const emailBody = `
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> La mascota ${petName} ha sido adoptada </title>
</head>
<body style="background-color: #ffffff; font-family: 'Caveat', Arial; color: #4d82bc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="background-color: #005187; padding: 20px;">
                <h1 style="color: #ffffff; font-size: 24px; font-family: 'Caveat', Arial; margin: 0;"> ${userName} ¡Queremos agradecerte tu interés en la adopción a través de nuestra plataforma!</h1>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Lamentamos comunicarte que no has sido seleccionado como adoptante para ${petName}, estamos convencidos que ha sido una decisión dificil para ${ownerName}
                </p>
                <p>
                    Todas las decisiones del animal se basan buscando las necesidades especificas del animal y de su adaptación al entorno.
                </p>
                <p>
                    Por favor, no tomes esta acción como un reflejo negativo de tus cualidades o de tu capacidad para cuidar de un animal.
                </p>

                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Entendemos que esta noticia puede decepcionante y queremos recordarte que hay muchos otros animales en busca de un hogar con mucho amor.
                </p>
                <p>
                   ¡Te animamos a que continúes buscando en nuestra plataforma para encontrar otro compañero que sea ideal para ti!
                </p>
 
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    ¡Gracias de nuevo por tu comprensión y tu interés! ¡Esperamos poder ayudarte en tu búsqueda de un nuevo amigo!
                </p>
                
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Para cualquier duda o información que necesites, estaremos aquí para ayudarte a encontrar un nuevo miembro para tu familia:
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
