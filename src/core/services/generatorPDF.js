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

    /*                                                     FECHA DEL CONTRATO ---------------------------*/
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

    //                             Fecha Veterinario clausula 11: Calculamos cuando tiene 70 dias (10 semanas)
    let vetAnimal = new Date(fechaUTC.setDate(fechaUTC.getDate() + 70));
    let vetAnimalMonth = vetAnimal.getUTCMonth() + 1;
    let vetAnimalNextMonth = (vetAnimalMonth + 1) % 12;
    let vetAnimalYear = vetAnimal.getFullYear();

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

    vetAnimalMonth = meses[vetAnimalMonth];
    vetAnimalNextMonth = meses[vetAnimalNextMonth];

    if (!animal.numberID) {
      animal.numberID = "(Sin número)";
    }

    doc.pipe(stream);

    // Título del documento
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("CONTRATO DE ADOPCIÓN", { align: "center" })
      .moveDown(2);

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
        `Reunidos, de una parte, ${cedente.name} ${adoptante.lastname} con DNI ${cedente.NIF}, domicilio en ${cedente.address} y teléfono ${cedente.phone}, en adelante denominado como CEDENTE, y de otra parte, ${adoptante.name} ${adoptante.lastname} con DNI ${adoptante.nif}, domicilio en ${adoptante.address} y teléfono ${adoptante.phone}, en adelante denominado como ADOPTANTE, que el ADOPTANTE desea adoptar definitivamente al animal que responde a las siguientes características:`,
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
      .moveDown(2);

    // Cláusulas del contrato
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CLÁUSULAS DEL CONTRATO", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
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
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("2. El animal entregado en adopción no podrá ser utilizado para:", {
        align: "justify",
      })
      .moveDown(0.5);

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

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
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
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "4. El adoptante se compromete con este contrato a proporcionar al animal alimentación y bebida suficiente y adecuada, los cuidados de higiene necesarios y la debida asistencia veterinaria; a cuidarlo y respetarlo a proporcionarle compañía, afecto y atenciones y a tenerlo consigo.",
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "5. Asimismo, se compromete a no regalar, vender o ceder por cualquier título, al animal; y a no abandonarlo. En caso de no poder atenderlo o ante cualquier circunstancia que produjese la imposibilidad de tener consigo al animal, mantener los términos de este contrato, o deseo de rescindir el mismo, el adoptante se compromete a  mantener al gato hasta encontrar nueva adopción o acogida, en ningún caso se puede devolver el animal al cedente ya que son casas particulares y no disponen de refugio ni protectora.",
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "6. En caso de fallecimiento del adoptante, tendrán preferencia para subrogarse en el presente contrato, por el siguiente orden: el cónyuge o pareja que conviviese con el adoptante; ascendientes o descendientes del adoptante. Dicha persona notificará su voluntad de celebrar un nuevo contrato en los mismos términos del presente. Si las personas señaladas en el párrafo anterior no desean subrogarse se comprometen a mantenerlo hasta encontrar nueva adopción o acogida.",
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("El adoptante se compromete por el presente contrato a:", {
        align: "justify",
      })
      .moveDown(0.5);

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
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "9. La desaparición del animal, por robo, perdida o por cualquier otra causa, debe ser notificada en el plazo máximo de las cuarenta y ocho horas siguientes a la misma, por burofax o cualquier otro medio que garantice fehacientemente la recepción de dicha comunicación. El Adoptante debe interponer la correspondiente denuncia en la Comisaría de la Policía Local en dichas cuarenta y ocho siguientes a la desaparición. Si existiesen indicios de que ha existido dolo o negligencia por parte del Adoptante en relación con dicha desaparición, se procederá a la inmediata interposición de la correspondiente denuncia por parte del responsable de la adopción.",
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "10. El responsable hace una reserva de dominio sobre el animal, de tal forma que el incumplimiento de cualquiera de las obligaciones anteriormente descritas y asumidas por el adoptante en el presente contrato, supondrá la resolución de pleno derecho del mismo, y facultará de inmediato a dicha persona para retirar al animal y recuperar su custodia o requisarlo temporalmente mientras se hacen las comprobaciones pertinentes, todo ello sin trámite adicional de ningún tipo. Asimismo, el responsable se reserva el ejercicio de las acciones legales que le asistan en cada caso.",
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `11. El coste de la adopción del animal será de un total de ${animal.cost} € por los gastos veterinarios (chip, cartilla y vacunación antirrábica), debiendo ser abonados por el adoptante. Si el animal no tuviera edad suficiente para poder vacunarlo y ponerle el microchip de manera segura, se realizarán ambos procedimientos cuando tenga aproximadamente 10 semanas, entre el mes de ${vetAnimalMonth} y el mes de ${vetAnimalNextMonth} de ${vetAnimalYear}`,
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `12. Ambas partes, tras manifestar su plena capacidad de obrar, prestan libre y voluntariamente su consentimiento al presente contrato, aceptando expresamente todas y cada una de las condiciones y obligaciones reflejadas del mismo.`,
        {
          align: "justify",
        }
      )
      .moveDown(0.5);

    doc.fontSize(12).font("Helvetica").text("Firma del Cedente:", 100, doc.y);
    doc.moveDown(0.5);
    doc.lineCap("butt").moveTo(100, doc.y).lineTo(300, doc.y).stroke();
    doc.moveDown(0.5);
    doc.text(`${cedente.name} (Cedente)`, 100, doc.y);
    doc.moveDown(2);

    doc.text("Firma del Adoptante:", 100, doc.y);
    doc.moveDown(0.5);
    doc.lineCap("butt").moveTo(100, doc.y).lineTo(300, doc.y).stroke();
    doc.moveDown(0.5);
    doc.text(`${adoptante.name} (Adoptante)`, 100, doc.y);

    // Fecha de firma
    doc.moveDown(2);
    doc.text("Fecha:", 100, doc.y);
    doc.text(`${dia} de ${mes} ${year}`, 150, doc.y);

    doc.end();

    stream.on("finish", () => {
      console.log(
        `Documento contractual ${requestId} generado y guardado en ${filePath}`
      );
    });

    stream.on("error", (error) => {
      console.log(`Error al generar el documento - ${error}`);
    });
  });
}

module.exports = createAdoptionContract;
