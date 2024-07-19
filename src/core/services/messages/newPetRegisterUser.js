const year = new Date().getFullYear();

const newPetRegisterU = async (petName, petSpecie, animalLimit) => {
  const emailBody = `
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> La mascota ${petName} se ha registrado correctamente</title>
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
                    ¡Te agradecemos mucho la confianza depositada en nosotros! Y poder permitirnos encontrarle un hogar con mucho amor a ${petName}!
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Recuerda que Spot My Pet es una plataforma enfocada para ayudar las protectoras, no obstante, sabemos que a veces por alguna cuestión encontramos animales que necesitan que les busquemos un hogar.
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Es por ello, que limitamos nuestro servicio de adopción para los usuarios con dar de alta 3 animales al año.
                </p>
                
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                   Actualmente tienes ${animalLimit} dado de alta con nosotros.
                </p>
 
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    ¡Esperamos poder ayudarte a encontrar una nueva familia a ${petName} muy pronto! Ya puedes encontrar a nuestro amigo en la categoría ${petSpecie}
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    Te mantendremos informado de cada usuario que solicite la adopción de mascota, para que puedas evaluar su solicitud.
                </p>
                <p style="font-size: 16px; color: #4d82bc; font-family: 'Caveat', Arial; margin: 0;">
                    De nuevo agradecemos tu confianza, atentamente:
                    El equipo de Spot My Pet
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

module.exports = newPetRegisterU;
