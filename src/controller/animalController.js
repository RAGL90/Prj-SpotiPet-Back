//Recogemos model de Animal
const animalModel = require("../models/animalModel");

//LECTURA DEL ANIMAL - ESTA SERÁ LA CONSULTA DE LOS ANIMALES Y NO REQUIERE DE REGISTRO DE USUARIO:
const getAnimals = async (req, res) => {
  let { page, limit, name, gender, specie, size, breed, location } = req.query;
  //Necesitamos operar con números por lo que convertimos String => Numbers
  page = parseInt(page) || 1; // Si no se indica, default: 1
  limit = parseInt(limit) || 20; // default: 20
  limit = limit > 50 ? 50 : limit; //Ternario para no hacer una consulta enorme en el endpoint

  // Creamos un objeto para establecer un filtro dinámico (Lo principal es que busque animales disponibles)
  const filters = { status: "available" };

  // Si se pasan parámetros de búsqueda => iremos agregando estos campos a los filtros
  // && param.trim()) para asegurarse de que solo los parámetros no vacíos se añadan al objeto de filtros.
  if (name && name.trim()) {
    filters.name = { $regex: name, $options: "i" }; // Búsqueda insensible a mayúsculas/minúsculas
  }
  if (gender && gender.trim()) {
    filters.gender = gender;
  }
  if (specie && specie.trim()) {
    filters.specie = specie; // Filtrado por especie
  }
  if (breed && breed.trim()) {
    filters.breed = { $regex: breed, $options: "i" }; // Búsqueda por raza
  }
  if (size && size.trim()) {
    filters.size = size;
  }
  if (location && location.trim()) {
    filters.location = location;
  }

  try {
    const animals = await animalModel
      .find(filters)
      .sort({ urgent: -1, registerDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-owner.ownerId -owner.ownerType");

    /*
        Los adoptados estarán excluidos de la búsqueda general: .find({ status: "available" }) 
        .sort({ urgent: -1, registerDate: -1 })
        Con "-1", Mongo organiza de forma descendente, aquellos que sean urgentes se mostrarán primero, y luego el criterio será
        la fecha de registro.
  
        .skip((page - 1) * limit)
        Omitimos una cantidad de datos/animales en la consulta, este salto varía en función de la página y el limite dado
        Ej: Página 2, con límite 20 datos => 2(Página) - 1 x 20(Limite) = 1 x 20 = 20 => comenzará la consulta en el resultado 21
        
        .limit(limit);
        Delimitación de la consulta, se indican cuantos datos o animales se van a ver por consultas, indicado por la petición.
        */

    //ANTES DE DAR LA RESPUESTA, Mongo debe conocer el tamaño de los documentos:
    const total = await animalModel.countDocuments();

    res.json({
      data: animals,
      total,
      page,
      pages: Math.ceil(total / limit), // Ceil redondea al entero igual o superior, obtenemos las páginas dividiendo:
      //                                                                   Total de documentos / Limite de la consulta
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido realizar la carga de animales",
      error: error.message,
    });
  }
};

const getAnimalId = async (req, res) => {
  try {
    if (!req.params.animalId) {
      return res.status(404).json({
        status: "failed",
        message: "ID del animal no facilitada",
      });
    }
    const animalId = req.params.animalId;
    const animal = await animalModel.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        status: "failed",
        message: "Animal no localizado, revise la ID del animal proporcionado",
      });
    }
    res.json({
      status: "succeeded",
      data: animal,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido leer los datos del animal",
      error: error.message,
    });
  }
};

module.exports = { getAnimals, getAnimalId };
