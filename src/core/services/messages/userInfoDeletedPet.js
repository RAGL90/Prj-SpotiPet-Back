const year = new Date().getFullYear();

const newPetRegister = async (userName, petName) => {
  const emailBody = `
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> La mascota ${petName} se ha eliminado de la plataforma </title>
</head>
<body style="background-color: #ffffff; font-family: 'Caveat', Arial; color: #4d82bc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="background-color: #005187; padding: 20px;">
                <h1 style="color: #ffffff; font-size: 24px; font-family: 'Caveat', Arial; margin: 0;"> ${userName} ¡Queremos agradecerte tu interés en adoptar a través de nuestra plataforma y por tu compromiso con el bienestar animal!</h1>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Lamentamos informarte que ${petName}, ya no está disponible para su adopción. No disponemos los detalles específicos del motivo dado que el animal ha sido eliminado
                </p>
                <p>
                    Es posible que el animal pueda haber sido adoptado localmente, transferido a alguna asociación, u otros cambios en su situación que hayan requerido su eliminación. 
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Entendemos que esta noticia puede decepcionante y queremos asegurarte que hay muchos otros animales en busca de un hogar con mucho amor.
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
