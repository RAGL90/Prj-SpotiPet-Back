const PDFDocument = require("pdfkit");

//Para crear el documento en el servidor:
const fs = require("fs");
const path = require("path");

//Generar carpeta si no existe - Usado en uploadRoutes
function directoryTest(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

//Se recibirán como objetos:   SOLICITANTE, PROPIETARIO, animal, ID de la solicitud(string)
function createAdoptionContract(adoptante, cedente, animal, requestId) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    //Zona de generación: src/contracts/:id.pdf
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "contracts",
      `${requestId}.pdf`
    );

    //Funcion para revisar si existe carpeta o se debe crear
    directoryTest(filePath);

    //Constante para controlar errores con filesystem
    const stream = fs.createWriteStream(filePath);

    /*                                                 FECHA DEL CONTRATO ---------------------------*/
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const year = fechaActual.getFullYear();

    /*                                                 TRANSFORMACIONES DE UTC a dd/mm/yyyy ---------------------------*/
    let fechaUTC = new Date(animal.birthDate);

    let dd = fechaUTC.getUTCDate();
    let mm = fechaUTC.getUTCMonth() + 1;
    let yyyy = fechaUTC.getFullYear();

    let animalBirth = `${dd}/${mm}/${yyyy}`;

    //                                        AREA DE CALCULOS DE FECHA CLAUSULA 11: VETERINARIA

    /*  1. Discernir el animal y cuando tiene que acudir al veterinario:
        Perro: 
        Gato: 70 días desde el nacimiento
    */
    // Transformación de fecha para cláusula 11 - Veterinaria
    let vetAnimal = new Date(fechaUTC.setDate(fechaUTC.getDate() + 70));
    let vetAnimalMonthIndex = vetAnimal.getUTCMonth(); // Mes como índice (0-11)
    let vetAnimalNextMonthIndex = (vetAnimalMonthIndex + 1) % 12; // Mes siguiente, cíclicamente

    //Generamos array de meses
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    //Extraemos meses para la visita clínica del animal
    let vetAnimalMonth = meses[vetAnimalMonthIndex];
    let vetAnimalNextMonth = meses[vetAnimalNextMonthIndex];

    //Extraemmos año de la visita
    let vetAnimalYear = vetAnimal.getFullYear();

    // Solo incrementamos el año si pasamos de diciembre a enero
    if (vetAnimalMonthIndex === 11 && vetAnimalNextMonthIndex === 0) {
      vetAnimalYear += 1;
    }
    // Generamos la coletilla de la clausula, por defecto, cadena vacía:
    let clausula11 = "";

    // Y si la fecha veterinaria es posterior a la fecha de contrato corregimos la coletilla, para que lo indique
    if (vetAnimal.getTime() > fechaActual.getTime()) {
      clausula11 = `Si el animal no tuviera edad suficiente para poder vacunarlo y ponerle el microchip de manera segura, se realizarán ambos procedimientos cuando tenga aproximadamente 10 semanas, entre el mes de ${vetAnimalMonth} y el mes de ${vetAnimalNextMonth} de ${vetAnimalYear}`;
    }

    //------ Correcciones de datos:
    //A. No tiene un ID de la protectora o numero de chip
    if (!animal.numberID) {
      animal.numberID = "(Sin número)";
    }

    //B. El animal es de especie "Otros" -> Obtenemos sus datos desde breed:
    if (animal.specie === "Otros") {
      animal.specie = animal.breed;
    }
    if (animal.specie === "Perros") {
      animal.specie = "Canina";
    }
    if (animal.specie === "Gatos") {
      animal.specie = "Felina";
    }
    if (cedente.tipoNIF === "CIF") {
      cedente.lastname = "";
    }

    doc.pipe(stream);

    //IMAGEN
    doc.image("./src/core/img/SMP-Signature.jpg", 250, 30, {
      width: 120,
    });
    doc.moveDown(5);

    // Título del documento
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("CONTRATO DE ADOPCIÓN", { align: "center" })
      .moveDown(1);

    // Introducción
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`En ${cedente.locality}, a ${dia} de ${mes} de ${year}`, {
        align: "center",
      })
      .moveDown(1);

    doc
      .text(
        `Reunidos, de una parte, ${cedente.name} ${adoptante.lastname} con ${cedente.tipoNIF} ${cedente.NIF}, domicilio en ${cedente.address} y teléfono ${cedente.phone}, en adelante denominado como CEDENTE, y de otra parte, ${adoptante.name} ${adoptante.lastname} con ${adoptante.tipoNIF} ${adoptante.nif}, domicilio en ${adoptante.address} y teléfono ${adoptante.phone}, en adelante denominado como ADOPTANTE, que el adoptante desea adoptar definitivamente al animal que responde a las siguientes características:`,
        { align: "justify" }
      )
      .moveDown(1);

    // Características del animal
    doc
      .fontSize(12)
      .list([
        `Especie: ${animal.specie}`,
        `Raza: ${animal.breed}`,
        `Sexo: ${animal.gender}`,
        `Nombre: ${animal.name}`,
        `Nacimiento: ${animalBirth}`,
        `Color: ${animal.mainColor}`,
        `Pelo: ${animal.hairType}`,
        `Signos particulares: ${animal.physicFeatures}`,
        `Nº de identificación: ${animal.numberID}`,
      ])
      .moveDown(1.5);

    // Cláusulas del contrato
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CLÁUSULAS DEL CONTRATO", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "Como adoptante del animal mencionado en este contrato, y declarando que todos los datos anteriores son ciertos, me comprometo mediante la firma de este documento a:",
        { align: "justify" }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "1. Aceptar que el responsable designado efectúe las visitas de control que considere necesarias, y compruebe el estado de salud y bienestar del animal.",
        { align: "justify" }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("2. El animal entregado en adopción no podrá ser utilizado para:", {
        align: "justify",
      })
      .moveDown(1);

    doc
      .fontSize(12)
      .list([
        `Caza de cualquier tipo y circunstancia.`,
        `Experimentación de cualquier tipo.`,
        `La participación en peleas o enfrentamientos con otros animales.`,
        `La cría.`,
        `Guarda de propiedades.`,
        `Circos u otro tipo de espectáculos.`,
        `Estancias en fincas o chalets de fin de semana, salvo casos excepcionales.`,
      ])
      .moveDown(2);

    doc.addPage();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "En ningún caso podrá el animal permanecer atado ni encerrado en jaulas, habitaciones,terrazas, patios o garajes; ni en lugares donde no pueda resguardarse de la lluvia, del frío o del sol, o sin espacio suficiente para el normal desarrollo de su especie.",
        { align: "justify" }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "3. En ningún caso se podrá someter al animal a cualquier tratamiento indebido y contrario a las disposiciones de la Ley de Protección Animal vigente y demás normativa que la desarrolle, y Código Penal. En ningún caso se podrá realizar al animal ninguna amputación relacionada con estética (orejas y rabo) ni tampoco desungulación.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "4. El adoptante se compromete con este contrato a proporcionar al animal alimentación y bebida suficiente y adecuada, los cuidados de higiene necesarios y la debida asistencia veterinaria; a cuidarlo y respetarlo a proporcionarle compañía, afecto y atenciones y a tenerlo consigo.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `5. Asimismo, se compromete a no regalar, vender o ceder por cualquier título, al animal; y a no abandonarlo. En caso de no poder atenderlo o ante cualquier circunstancia que produjese la imposibilidad de tener consigo al animal, mantener los términos de este contrato, o deseo de rescindir el mismo, el adoptante se compromete a  mantener al ${animal.specie} hasta encontrar nueva adopción o acogida, en ningún caso se puede devolver el ${animal.specie} al cedente ya que son casas particulares y no disponen de refugio ni protectora.`,
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "6. En caso de fallecimiento del adoptante, tendrán preferencia para subrogarse en el presente contrato, por el siguiente orden: el cónyuge o pareja que conviviese con el adoptante; ascendientes o descendientes del adoptante. Dicha persona notificará su voluntad de celebrar un nuevo contrato en los mismos términos del presente. Si las personas señaladas en el párrafo anterior no desean subrogarse se comprometen a mantenerlo hasta encontrar nueva adopción o acogida.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("El adoptante se compromete por el presente contrato a:", {
        align: "justify",
      })
      .moveDown(1);

    doc
      .fontSize(12)
      .list([
        "Desparasitar internamente al animal cada 6 meses con producto veterinario adecuado para ello.",
        "Vacunarle anualmente con vacuna pentavalente.",
        "Esterilizarlo antes de los 6 meses de edad si es hembra y a los 6 meses si es macho. Y aportar al responsable un informe veterinario que acredite haberse realizado dicha esterilización (sellado, firmado, con nº de colegiado y con identificación del animal).",
      ])
      .moveDown(2);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "8. Utilizar los servicios de un veterinario si por una enfermedad incurable tuviera que ser sacrificado; previamente el responsable deberá recibir un informe veterinario en el que consten las circunstancias y por qué se recomienda la eutanasia. Si se produjese la defunción del animal, esta debe ser notificada inmediatamente (por buro fax o cualquier otro medio que garantice fehacientemente la recepción de dicha comunicación) al responsable en el plazo máximo de 1 semana desde el fallecimiento, decidiendo, en todo caso, dicha persona la eventualidad de practicar autopsia para esclarecer las causas de la muerte. Si existiesen indicios de que ha existido dolo o negligencia por parte del Adoptante en relación con dicha defunción, se procederá a la inmediata interposición de la correspondiente denuncia por parte del responsable.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "9. La desaparición del animal, por robo, perdida o por cualquier otra causa, debe ser notificada en el plazo máximo de las cuarenta y ocho horas siguientes a la misma, por burofax o cualquier otro medio que garantice fehacientemente la recepción de dicha comunicación. El Adoptante debe interponer la correspondiente denuncia en la Comisaría de la Policía Local en dichas cuarenta y ocho siguientes a la desaparición. Si existiesen indicios de que ha existido dolo o negligencia por parte del Adoptante en relación con dicha desaparición, se procederá a la inmediata interposición de la correspondiente denuncia por parte del responsable de la adopción.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "10. El responsable hace una reserva de dominio sobre el animal, de tal forma que el incumplimiento de cualquiera de las obligaciones anteriormente descritas y asumidas por el adoptante en el presente contrato, supondrá la resolución de pleno derecho del mismo, y facultará de inmediato a dicha persona para retirar al animal y recuperar su custodia o requisarlo temporalmente mientras se hacen las comprobaciones pertinentes, todo ello sin trámite adicional de ningún tipo. Asimismo, el responsable se reserva el ejercicio de las acciones legales que le asistan en cada caso.",
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `11. El coste de la adopción del animal será de un total de ${animal.cost} € por los gastos veterinarios (chip, cartilla y vacunación antirrábica), debiendo ser abonados por el adoptante. ${clausula11}`,
        {
          align: "justify",
        }
      )
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `12. Ambas partes, tras manifestar su plena capacidad de obrar, prestan libre y voluntariamente su consentimiento al presente contrato, aceptando expresamente todas y cada una de las condiciones y obligaciones reflejadas del mismo.`,
        {
          align: "justify",
        }
      )
      .moveDown(2);

    //Firma cedente:

    //Guardamos el eje Y actual
    const initialY = doc.y;
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Firma del Cedente:`, 100, initialY);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Firma del Adoptante:`, 370, initialY);

    //Al eje Y anterior le metemos un espacio de 20 para la firma
    const signatureArea = initialY + 100;

    doc
      .lineCap("butt")
      .moveTo(100, signatureArea)
      .lineTo(270, signatureArea)
      .stroke();
    doc
      .lineCap("butt")
      .moveTo(370, signatureArea)
      .lineTo(520, signatureArea)
      .stroke();

    //Al espacio de firma le metemos unos 5 para indicar el nombre
    const signatureNames = signatureArea + 5;
    doc.text(
      `${cedente.name} ${cedente.lastname} (Cedente)`,
      100,
      signatureNames
    );
    doc.text(
      `${adoptante.name} (Adoptante) ${cedente.lastname}`,
      370,
      signatureNames
    );

    doc.moveDown(2.5);

    // Fecha de firma
    doc.text(`Fecha: ${dia} de ${mes} del ${year}`, 100, doc.y);

    doc.end();

    stream.on("finish", () => {
      console.log(
        `Documento contractual ${requestId} generado y guardado en ${filePath}`
      );
      //Resolvemos la respuesta de la promesa generada al inicio de la función
      resolve(filePath);
    });

    stream.on("error", (error) => {
      console.log(`Error al generar el documento - ${error}`);
      //Rechazamos la promesa devolviendo el error
      reject(error);
    });
  });
}

module.exports = createAdoptionContract;
