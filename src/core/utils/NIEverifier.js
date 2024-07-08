const NIFverifier = (tipoNIF, NIF) => {
  console.log("WORKING");
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

    // Formamos el número completo y extraemos la letra de control
    let numero = numeroEquivalente + NIF.substring(1, NIF.length - 1);
    const letra = NIF.charAt(NIF.length - 1).toUpperCase();

    // Calculamos el índice y verificamos la letra de control
    const control = parseInt(numero) % 23;

    if (letrasControl.charAt(control) === letra) {
      console.log("NIE es correcto");
      return true;
    } else {
      console.log("Letra de control incorrecta");
      return false;
    }
  }
};

console.log(NIFverifier("NIE", "X1234567T"));
