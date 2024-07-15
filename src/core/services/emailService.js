const nodemailer = require("nodemailer");
const timeStamp = require("../utils/timeStamp");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ricgarlue@gmail.com",
    pass: "vxip mdag yroq wfdo",
  },
});

const sendEmail = async (userEmail, messageSubject, message) => {
  try {
    const mailOptions = {
      from: "ricgarlue@gmail.com",
      to: userEmail,
      subject: messageSubject,
      html: `<div> ${message} </div>`,
      attachments: [
        {
          filename: "SpotMyPetSignature.jpg",
          path: "../Back/src/core/img/SMP-Signature.jpg",
          cid: "unique@logo.cid",
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    const time = timeStamp();
    console.log(
      `${time} Se ha enviado el email de registro a ${userEmail} correctamente`
    );
  } catch (error) {
    const time = timeStamp();
    console.log(
      `${time} No se ha podido enviar el email de bienvenida al usuario ${userEmail} debido a: `,
      error
    );
  }
};

module.exports = { sendEmail };
