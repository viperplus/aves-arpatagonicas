/* Aves de la Patagonia Norte - datos de las especies */
/* Fuente única: alimenta las tarjetas impresas, la guía y los modelos 3D. */

window.AVES = [
  {
    id: "chimango",
    nombre: "Chimango",
    cientifico: "Milvago chimango",
    grupo: "Rapaz carroñera",
    habitat: "Campos, estepa y alrededores de los establecimientos",
    tamano: "40 a 45 cm",
    alimento: "Carroña, insectos y pequeños animales",
    dato: "Es la rapaz más común de la Patagonia. Muchas veces se la ve caminando por el suelo entre las ovejas, buscando comida que queda a su alcance.",
    donde: "Muy frecuente en toda la región durante todo el año.",
    color: "#8a6a3d",
    paleta: {
      cuerpo: "#a8814e", barriga: "#d8bd8e", ala: "#7a5c33", cola: "#6f5430",
      pico: "#5a5a5a", patas: "#c9a227", cabeza: "#96743f", detalle: "#4d3b1f", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "gancho", alas: "plegadas" }
  },
  {
    id: "carancho",
    nombre: "Carancho",
    cientifico: "Caracara plancus",
    grupo: "Rapaz",
    habitat: "Estepa abierta, bordes de rutas y lagunas",
    tamano: "50 a 60 cm",
    alimento: "Carroña, huevos, insectos y animales pequeños",
    dato: "Tiene la cara sin plumas y de color naranja, como un gallo. Es un excelente caminador: corre por el suelo persiguiendo presas tanto como vuela.",
    donde: "Abundante en campos abiertos y junto a las lagunas saladas.",
    color: "#3c3a36",
    paleta: {
      cuerpo: "#4a4740", barriga: "#d9d2c0", ala: "#2f2d28", cola: "#e8e2d2",
      pico: "#c9a227", patas: "#c9a227", cabeza: "#8a8578", detalle: "#1f1e1b", ojo: "#1a1a1a"
    },
    forma: { cuello: "medio", patas: "largas", cresta: true, cola: "larga", pico: "gancho", alas: "plegadas" }
  },
  {
    id: "tero",
    nombre: "Tero",
    cientifico: "Vanellus chilensis",
    grupo: "Ave limícola",
    habitat: "Pastizales y campos bajos con agua cerca",
    tamano: "32 a 38 cm",
    alimento: "Insectos, lombrices y semillas",
    dato: "Defiende su nido, que hace en el suelo, con mucha valentía: picotea y grita para alejar a caballos, perros y hasta personas que se acercan demasiado.",
    donde: "En campos con pasto corto, cerca de arroyos y lagunas.",
    color: "#5b6770",
    paleta: {
      cuerpo: "#6b7680", barriga: "#f2f2ee", ala: "#2e3540", cola: "#f2f2ee",
      pico: "#1a1a1a", patas: "#b03a2e", cabeza: "#2e3540", detalle: "#f2f2ee", ojo: "#c0392b"
    },
    forma: { cuello: "medio", patas: "largas", cresta: false, cola: "corta", pico: "recto", alas: "plegadas" }
  },
  {
    id: "martineta",
    nombre: "Martineta",
    cientifico: "Rhynchotus rufescens",
    grupo: "Tinamú",
    habitat: "Pastizales altos y rastrojos",
    tamano: "40 a 45 cm",
    alimento: "Semillas, brotes e insectos",
    dato: "Lleva un penacho de plumas que levanta hacia adelante, como si fuera un flequillo. Sus huevos tienen un brillo verde metálico muy llamativo.",
    donde: "En el pastizal de la estepa; se la escucha antes de verla.",
    color: "#9c7a4e",
    paleta: {
      cuerpo: "#a8875a", barriga: "#d9c49a", ala: "#7a5c33", cola: "#8a6a3d",
      pico: "#4a3c2a", patas: "#c9a227", cabeza: "#96743f", detalle: "#5a4526", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: "adelante", cola: "corta", pico: "recto", alas: "plegadas" }
  },
  {
    id: "choique",
    nombre: "Choique (ñandú petiso)",
    cientifico: "Rhea pennata",
    grupo: "Ave corredora",
    habitat: "Estepa y mesetas, con arbustos bajos",
    tamano: "90 a 100 cm de alto",
    alimento: "Hojas, frutos, semillas e insectos",
    dato: "No vuela, pero corre muy rápido. El macho es el que cuida los huevos: incuba hasta 50 huevos de varias hembras y después cría a los pichones solo.",
    donde: "Estepa profunda; a veces se lo ve cerca de las rutas, de a grupos chicos.",
    color: "#7a6a52",
    paleta: {
      cuerpo: "#8a7a60", barriga: "#c9b896", ala: "#6b5c46", cola: "#6b5c46",
      pico: "#4a3c2a", patas: "#c9b896", cabeza: "#7a6a52", detalle: "#e8e2d2", ojo: "#1a1a1a"
    },
    forma: { cuello: "largo", patas: "largas", cresta: false, cola: "abierta", pico: "recto", alas: "plegadas" }
  },
  {
    id: "cacholote",
    nombre: "Cacholote",
    cientifico: "Pseudoseisura lophotes",
    grupo: "Ave cantora",
    habitat: "Estepa con arbustos y cardones",
    tamano: "26 a 30 cm",
    alimento: "Insectos, gusanos y semillas",
    dato: "Construye un nido enorme de palos y barro, del tamaño de una pelota de fútbol, que usa durante muchos años y se oye desde lejos por su canto fuerte.",
    donde: "Muy común en el monte bajo; su nido de barro es fácil de reconocer.",
    color: "#8a7f6a",
    paleta: {
      cuerpo: "#9a8f78", barriga: "#c9bfa8", ala: "#7a7058", cola: "#7a7058",
      pico: "#4a3c2a", patas: "#6b5c46", cabeza: "#8a7f6a", detalle: "#5a5240", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: true, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "loica",
    nombre: "Loica",
    cientifico: "Sturnella loyca",
    grupo: "Saisón",
    habitat: "Pastizales y campos abiertos",
    tamano: "24 a 28 cm",
    alimento: "Insectos y semillas",
    dato: "El macho tiene el pecho rojo intenso. Canta desde un lugar alto, como un alambrado o una piedra, con una melodía muy clara que se escucha en la quietud de la tarde.",
    donde: "Pastizales bajos; se la ve caminando por el suelo buscando comida.",
    color: "#b5651d",
    paleta: {
      cuerpo: "#8a7f6a", barriga: "#c94f2e", ala: "#6b5c46", cola: "#6b5c46",
      pico: "#4a3c2a", patas: "#c9b896", cabeza: "#5a5240", detalle: "#c9b896", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "aguila",
    nombre: "Águila mora",
    cientifico: "Geranoaetus melanoleucus",
    grupo: "Rapaz",
    habitat: "Estepa, sierras y bordes de los ríos",
    tamano: "60 a 80 cm; hasta 2 m de envergadura",
    alimento: "Conejos, liebres, reptiles y aves",
    dato: "Vuela en círculos muy altos, casi invisible, y cae en picada sobre su presa. Es una de las rapaces más grandes que se pueden ver en la región.",
    donde: "Sobrevuela la estepa; a veces planea cerca de las lomas buscando presas.",
    color: "#3a4048",
    paleta: {
      cuerpo: "#3f4650", barriga: "#e8e2d2", ala: "#2e3540", cola: "#2e3540",
      pico: "#5a5a5a", patas: "#c9a227", cabeza: "#3f4650", detalle: "#1f2329", ojo: "#e8c64a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "abierta", pico: "gancho", alas: "plegadas" }
  },
  {
    id: "flamenco",
    nombre: "Flamenco austral",
    cientifico: "Phoenicopterus chilensis",
    grupo: "Ave acuática",
    habitat: "Lagunas saladas y bajos inundables",
    tamano: "1,10 a 1,30 m de alto",
    alimento: "Camarones y microorganismos que filtra con el pico",
    dato: "Su color rosa viene de los pigmentos de los camarones que come. En el Lago Pellegrini, a pocos kilómetros de las sedes del curso, se junta una de las colonias más grandes de la región.",
    donde: "Lagunas saladas, especialmente el Lago Pellegrini.",
    color: "#e08fa0",
    paleta: {
      cuerpo: "#f0b6be", barriga: "#f7dce1", ala: "#e85c6e", cola: "#1a1a1a",
      pico: "#e8b4c0", patas: "#f0b6be", cabeza: "#f7dce1", detalle: "#1a1a1a", ojo: "#e8c64a"
    },
    forma: { cuello: "largo", patas: "largas", cresta: false, cola: "corta", pico: "ganchudo", alas: "plegadas" }
  }
];
