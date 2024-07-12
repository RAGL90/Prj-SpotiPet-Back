const NIFverifier = (tipoNIF, NIF) => {
  let response = {
    valid: false,
    invalidCause: "",
    tipoAsociacion: "",
    raro: false,
  };
  if (tipoNIF === "DNI") {
    const letrasControl = "TRWAGMYFPDXBNJZSQVHLCKE";

    const numero = NIF.substring(0, NIF.length - 1); // Recogemos los números
    const letra = NIF.charAt(NIF.length - 1).toUpperCase(); // Corrección aquí: cambié dni.length a NIF.length

    if (!/^\d{8}[A-Za-z]$/.test(NIF)) {
      response.invalidCause = "Formato de DNI no válido";
      return response;
    }

    const indice = parseInt(numero) % 23; // Asegúrate de convertir el número a entero

    if (letrasControl.charAt(indice) === letra) {
      response.valid = true;
      response.tipoAsociacion = "DNI";
      response.raro = true;
      return response;
    } else {
      response.invalidCause = "DNI inválido, revise las cifras y letras";
      return response;
    }
  }

  if (tipoNIF === "NIE") {
    const letrasControl = "TRWAGMYFPDXBNJZSQVHLCKE";

    // Comprobamos el formato con la expresión regular adecuada
    if (!/^[XYZ]\d{7}[A-Za-z]$/.test(NIF)) {
      response.invalidCause = "Formato NIE incorrecto, revise el NIE";
      return response;
    }

    // Convertimos la letra inicial en el número correspondiente
    let letraInicial = NIF.charAt(0).toUpperCase();
    let numeroEquivalente;
    switch (letraInicial) {
      case "X":
        numeroEquivalente = "0";
        break;
      case "Y":
        numeroEquivalente = "1";
        break;
      case "Z":
        numeroEquivalente = "2";
        break;
      default:
        console.log("Letra inicial de NIE inválida");
        return false;
    }

    // Formamos el número completo y extraemos la letra de control
    let numero = numeroEquivalente + NIF.substring(1, NIF.length - 1);

    const letra = NIF.charAt(NIF.length - 1).toUpperCase();

    // Calculamos el índice y verificamos la letra de control
    const control = parseInt(numero) % 23;

    if (letrasControl.charAt(control) === letra) {
      response.valid = true;
      response.tipoAsociacion = "NIE";
      response.raro = true;
      return response;
    } else {
      response.invalidCause = "NIE no válido repase cifras y letras";
      return response;
    }
  }

  if (tipoNIF === "CIF") {
    let letra = NIF.charAt(0).toUpperCase();

    if (!/^[A-Za-z]\d{8}$/.test(NIF)) {
      response.invalidCause = "Formato NIE incorrecto";
      return response;
    }
    // Si ha pasado el formateador , aceptaremos como válido el CIF

    response.valid = true;

    //*************************************Clasificamos según Tipos de Sociedades

    switch (letra) {
      case "G":
        response.tipoAsociacion = "Asociaciones";
        break;
      case "A":
        response.tipoAsociacion = "Sociedad Anonima";
        response.raro = true;
        break;

      case "B":
        response.tipoAsociacion = "Sociedad Limitada";
        response.raro = true;
        break;

      case "C":
        response.tipoAsociacion = "Sociedad colectiva";
        response.raro = true;
        break;

      case "D":
        response.tipoAsociacion = "Sociedad comanditaria";
        response.raro = true;
        break;

      case "E":
        response.tipoAsociacion = "Comunidad de bienes";
        response.raro = true;
        break;

      case "F":
        response.tipoAsociacion = "Sociedad cooperativas";
        response.raro = true;
        break;

      case "H":
        response.tipoAsociacion = "Comunidad de propietarios";
        response.raro = true;
        break;

      case "J":
        response.tipoAsociacion = "Sociedad civiles";
        response.raro = true;
        break;

      case "P":
        response.tipoAsociacion = "Sociedad civiles";
        response.raro = true;
        break;

      case "Q":
        response.tipoAsociacion = "Organismo Publico";
        response.raro = true;
        break;

      default:
        response.tipoAsociacion = "Otros";
        response.raro = true;
        break;
    }
    return response;
  }
};

module.exports = NIFverifier;
