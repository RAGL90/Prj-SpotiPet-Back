const year = new Date().getFullYear();

const newPetRegister = async (
  userName,
  petName,
  ownerName,
  ownerEmail,
  ownerPhone
) => {
  const emailBody = `
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Felicidades! Has sido seleccionado para adoptar a ${petName}</title>
</head>
<body style="background-color: #ffffff; font-family: 'Arial', sans-serif; color: #4d82bc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="background-color: #005187; padding: 20px;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">¡Felicidades ${userName}!</h1>
                <h2 style="color: #ffffff; font-size: 20px; margin-top: 10px;">Has sido seleccionado para darle un hogar a ${petName}!</h2>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px;">
                <p style="font-size: 16px; margin: 0;">
                    Nos complace informarte que tras un cuidadoso proceso de selección de ${ownerName}, has sido elegido como mejor
                </p>
                <p>
                    candidato para adoptar a ${petName}. Estamos seguros de que ${petName} tendrá un hogar con mucho amor y cuidado contigo.
                </P>

               <h2>Próximos Pasos:</h2>
                <ol>
                  <li><strong>Confirmación de Adopción</strong>: Por favor, confirma tu aceptación de la adopción enviando un email a ${ownerEmail} o llamando a <strong>${ownerPhone}</strong>.</li>
                  <li><strong>Cita para Conocer a <span class="highlight">${petName}</span></strong>: Una vez confirmada tu adopción, ${ownerName} te propondrá una cita para que puedas conocer a <strong>${petName}</strong> y llevarlo a su nuevo hogar. Esto también será una oportunidad para <strong>consultar</strong> cualquier pregunta que puedas tener sobre <strong>sus cuidados</strong>.</li>
                  <li><strong>Preparativos del Hogar</strong>: Te recomendamos preparar tu hogar para la llegada de <strong>${petName}</strong>. Esto incluye asegurar un espacio adecuado para dormir, juguetes, comida, y cualquier necesidad específica que ${petName} pueda tener.</li>
                </ol>
                <p style="font-size: 16px; margin-top: 20px;">
                    ¡Gracias por comprometerte con el bienestar de los animales y por abrir tu hogar a ${petName}!
                </p>
                <p style="font-size: 16px; margin: 0;">
                    Si tienes cualquier pregunta o información sobre el proceso.
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 10px;">
                <img src="cid:unique@logo.cid" style="width:100px; height:auto;">
            </td>
        </tr>
        <tr>
            <td align="center" style="background-color: #957698; padding: 10px;">
                <p style="color: #ffffff; font-size: 14px; font-family: 'Arial', sans-serif; margin: 0;">
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
