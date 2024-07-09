const NIFverifier = (tipoNIF, NIF) => {
  if (tipoNIF === "DNI") {
    const letrasControl = "TRWAGMYFPDXBNJZSQVHLCKE";

    const numero = NIF.substring(0, NIF.length - 1); // Recogemos los números
    const letra = NIF.charAt(NIF.length - 1).toUpperCase(); // Corrección aquí: cambié dni.length a NIF.length

    if (!/^\d{8}[A-Za-z]$/.test(NIF)) {
      return false;
    }

    const indice = parseInt(numero) % 23; // Asegúrate de convertir el número a entero

    if (letrasControl.charAt(indice) === letra) {
      return true;
    } else {
      return false;
    }
  }

  if (tipoNIF === "NIE") {
    console.log("Entra a ruta: tipo NIE");
    const letrasControl = "TRWAGMYFPDXBNJZSQVHLCKE";

    // Comprobamos el formato con la expresión regular adecuada
    if (!/^[XYZ]\d{7}[A-Za-z]$/.test(NIF)) {
      console.log("Formato NIE incorrecto");
      return false;
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
    console.log(
      "El sistema determina que la letra equivale a: " + numeroEquivalente
    );
    // Formamos el número completo y extraemos la letra de control
    let numero = numeroEquivalente + NIF.substring(1, NIF.length - 1);

    console.log(NIF + " equivale a " + numero);
    const letra = NIF.charAt(NIF.length - 1).toUpperCase();

    // Calculamos el índice y verificamos la letra de control
    const control = parseInt(numero) % 23;

    if (letrasControl.charAt(control) === letra) {
      return true;
    } else {
      return false;
    }
  }

  if (tipoNIF === "CIF") {
    let cifObject = {
      valid: false,
      tipoAsociacion: "",
      raro: false,
    };
    let letra = NIF.charAt(0).toUpperCase();

    if (!/^[A-Za-z]\d{8}$/.test(NIF)) {
      console.log("Formato NIE incorrecto");
      return false;
    }
    // Si ha pasado el formateador , se le da por bueno

    cifObject.valid = true;

    //************************************************ Tipos de Sociedades

    switch (letra) {
      case "G":
        cifObject.tipoAsociacion = "Asociaciones";
        break;
      case "A":
        cifObject.tipoAsociacion = "Sociedad Anonima";
        cifObject.raro = true;
        break;

      case "B":
        cifObject.tipoAsociacion = "Sociedad Limitada";
        cifObject.raro = true;
        break;

      case "C":
        cifObject.tipoAsociacion = "Sociedades colectivas";
        cifObject.raro = true;
        break;

      case "D":
        cifObject.tipoAsociacion = "Sociedades comanditarias";
        cifObject.raro = true;
        break;

      case "E":
        cifObject.tipoAsociacion = "Comunidades de bienes";
        cifObject.raro = true;
        break;

      case "F":
        cifObject.tipoAsociacion = "Sociedades cooperativas";
        cifObject.raro = true;
        break;

      case "H":
        cifObject.tipoAsociacion = "Comunidades de propietarios";
        cifObject.raro = true;
        break;

      case "J":
        cifObject.tipoAsociacion = "Sociedades civiles";
        cifObject.raro = true;
        break;

      case "P":
        cifObject.tipoAsociacion = "Sociedades civiles";
        cifObject.raro = true;
        break;

      case "Q":
        cifObject.tipoAsociacion = "Organismo Publico";
        cifObject.raro = true;
        break;

      default:
        cifObject.tipoAsociacion = "Otros";
        cifObject.raro = true;
        break;
    }
    return cifObject;
  }
};

module.exports = NIFverifier;
