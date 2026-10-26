/* Aves de la Patagonia Norte - datos de las especies */
/* Fuente única: alimenta las tarjetas impresas, la guía y los modelos 3D. */

window.AVES = [
  {
    id: "chingolo",
    nombre: "Chingolo",
    cientifico: "Zonotrichia capensis",
    grupo: "Semillero",
    habitat: "Pastizales, campos, jardines y bordes de las lagunas",
    tamano: "14 a 15 cm",
    alimento: "Semillas e insectos",
    dato: "Tiene un copete en la cabeza con dos rayitas negras. Canta distinto en cada región: el chingolo de la sierra no suena igual que el de la llanura, como si cada pueblo tuviera su propio dialecto.",
    donde: "En todo el país; lo encontrás cerca de las casas y también en el campo.",
    estado: "Preocupación menor (LC)",
    distribucion: "Toda Argentina, desde el noroeste hasta Tierra del Fuego.",
    epoca: "Residente todo el año.",
    color: "#9a5b2d",
    paleta: {
      cuerpo: "#8d7f6a", barriga: "#cfc4ab", ala: "#6b5f4c", cola: "#6b5f4c",
      pico: "#5a4c3a", patas: "#8a6a4a", cabeza: "#9c8f78", detalle: "#4a4038", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: true, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "calandria-grande",
    nombre: "Calandria grande",
    cientifico: "Mimus saturninus",
    grupo: "Ave cantora",
    habitat: "Montes, arboledas, parques y jardines",
    tamano: "25 a 27 cm",
    alimento: "Insectos, gusanos y frutos",
    dato: "Es una imitadora nata: repite el canto de otras aves. Su nombre viene de Mimus, que en latín significa 'mimo'. Se la reconoce por las cejas blancas y la cola larga que casi siempre lleva levantada.",
    donde: "En campos con árboles y también en los jardines de la ciudad.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina, hasta Río Negro.",
    epoca: "Residente.",
    color: "#6e6250",
    paleta: {
      cuerpo: "#918673", barriga: "#ddd4c0", ala: "#6b6151", cola: "#6b6151",
      pico: "#2f2b24", patas: "#2f2b24", cabeza: "#7d7260", detalle: "#e5ddc8", ojo: "#1a1a1a"
    },
    forma: { cuello: "medio", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "hornero",
    nombre: "Hornero",
    cientifico: "Furnarius rufus",
    grupo: "Ave constructora",
    habitat: "Campos abiertos, orillas de los ríos y pueblos",
    tamano: "17 a 19 cm",
    alimento: "Insectos, gusanos y otros animalitos del suelo",
    dato: "Construye su nido de barro con forma de horno de pan. Macho y hembra trabajan juntos durante semanas; adentro, la entrada da vuelta como un pasadizo que protege a los pichones del frío y de los enemigos.",
    donde: "Muy común en campos y pueblos; anida en alambradas, postes y árboles.",
    estado: "Preocupación menor (LC)",
    distribucion: "Centro y norte de Argentina, hasta Río Negro y Neuquén.",
    epoca: "Residente.",
    color: "#a34a24",
    paleta: {
      cuerpo: "#b0714a", barriga: "#d9c9ab", ala: "#8a5733", cola: "#8a5733",
      pico: "#54473c", patas: "#6b5f52", cabeza: "#a56b42", detalle: "#6b4426", ojo: "#1a1a1a"
    },
    forma: { cuello: "medio", patas: "medianas", cresta: false, cola: "larga", pico: "fino", alas: "plegadas" }
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
    estado: "Preocupación menor (LC)",
    distribucion: "Toda Argentina.",
    epoca: "Residente (movimientos locales).",
    color: "#5b6770",
    paleta: {
      cuerpo: "#6b7680", barriga: "#f2f2ee", ala: "#2e3540", cola: "#f2f2ee",
      pico: "#1a1a1a", patas: "#b03a2e", cabeza: "#2e3540", detalle: "#f2f2ee", ojo: "#c0392b"
    },
    forma: { cuello: "medio", patas: "largas", cresta: false, cola: "corta", pico: "recto", alas: "plegadas" }
  },
  {
    id: "loro-barranquero",
    nombre: "Loro barranquero",
    cientifico: "Cyanoliseus patagonus",
    grupo: "Loro",
    habitat: "Barrancas, acantilados y bosques",
    tamano: "40 a 52 cm",
    alimento: "Semillas, frutos y hierbas",
    dato: "Anida en colonias gigantes, excavando agujeros en los barrancos de piedra: por eso lo llaman barranquero. Tiene el abdomen rojo y vuela en grupos muy ruidosos.",
    donde: "Bosques y barrancos de la Patagonia y el oeste argentino.",
    estado: "Preocupación menor (LC)",
    distribucion: "Centro y sur de Argentina (Patagonia).",
    epoca: "Residente, con movimientos locales.",
    color: "#46703a",
    paleta: {
      cuerpo: "#5c7f4a", barriga: "#c2472e", ala: "#46708f", cola: "#55663f",
      pico: "#7a6a48", patas: "#7f7466", cabeza: "#736a54", detalle: "#d9c45a", ojo: "#3a3020"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "ganchudo", alas: "plegadas" }
  },
  {
    id: "golondrina-tijerita",
    nombre: "Golondrina tijerita",
    cientifico: "Hirundo rustica",
    grupo: "Golondrina",
    habitat: "Cielos abiertos sobre campos, ríos y pueblos",
    tamano: "15 cm",
    alimento: "Insectos que atrapa volando",
    dato: "Su cola larga y ahorquillada, con manchas blancas, parece una tijera abierta. Vuela todo el día cazando insectos y se posa en los alambres; en invierno viaja miles de kilómetros hasta el hemisferio norte.",
    donde: "Sobre campos y charcas; llega en primavera y se va en otoño.",
    estado: "Preocupación menor (LC)",
    distribucion: "Cría en el hemisferio norte; en Argentina en migración y verano.",
    epoca: "Migratoria (primavera-verano).",
    color: "#2f3f6b",
    paleta: {
      cuerpo: "#33517f", barriga: "#d8c39a", ala: "#263f66", cola: "#263f66",
      pico: "#1f1f1f", patas: "#3a332c", cabeza: "#2e4772", detalle: "#e8e2d2", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "fino", alas: "plegadas" }
  },
  {
    id: "jilguero-dorado",
    nombre: "Jilguero dorado",
    cientifico: "Sicalis flaveola",
    grupo: "Semillero",
    habitat: "Campos con pastizales, jardines y arboledas",
    tamano: "13 a 15 cm",
    alimento: "Semillas y algunos insectos",
    dato: "El macho es amarillo dorado con la cabeza gris y rayada; de ahí su nombre. Le gusta cantar desde un alambrado o desde la punta de un árbol, con la cola moviéndose al ritmo.",
    donde: "Pastizales y campos; cada vez más común en los parques de las ciudades.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina.",
    epoca: "Residente.",
    color: "#e89b1e",
    paleta: {
      cuerpo: "#f0b83a", barriga: "#f4d36b", ala: "#cf9a2e", cola: "#d9a333",
      pico: "#8f6b3e", patas: "#a8845c", cabeza: "#8a8270", detalle: "#4a4038", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "naranjero",
    nombre: "Naranjero",
    cientifico: "Rauenia bonariensis",
    grupo: "Tangara",
    habitat: "Arboledas, talares, parques y jardines con sombra",
    tamano: "17 a 19 cm",
    alimento: "Frutos, bayas e insectos",
    dato: "El macho tiene la cabeza celeste y el pecho naranja, muy fácil de reconocer. Sus nidos son uno de los favoritos del tordo renegrido, que le deja ahí uno de sus huevos para que otra ave se lo críe.",
    donde: "En campos arbolados; también en los parques de las ciudades.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina.",
    epoca: "Residente (algunos movimientos).",
    color: "#e0752a",
    paleta: {
      cuerpo: "#38352f", barriga: "#ea8a33", ala: "#2e2b27", cola: "#33302a",
      pico: "#2f2b26", patas: "#4a4238", cabeza: "#4f9ad6", detalle: "#1f1d1a", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "benteveo",
    nombre: "Benteveo",
    cientifico: "Pitangus sulphuratus",
    grupo: "Ave cantora",
    habitat: "Campos abiertos con árboles, alambradas y orillas del agua",
    tamano: "24 a 27 cm",
    alimento: "Insectos, frutas y pequeños animales",
    dato: "Su nombre suena como su grito: '¡bien te veo!'. Caza insectos al vuelo y no le hace asco una lagartija. Tiene una mancha amarilla en la cabeza que casi nunca se ve, porque la tapa una pluma.",
    donde: "En todas partes: campo, ciudad y junto a los arroyos.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina, hasta Río Negro.",
    epoca: "Residente.",
    color: "#d9a425",
    paleta: {
      cuerpo: "#9c8a55", barriga: "#e8c33a", ala: "#7d6d42", cola: "#6f6142",
      pico: "#26241f", patas: "#4a423a", cabeza: "#33302a", detalle: "#efe9d9", ojo: "#1a1a1a"
    },
    forma: { cuello: "medio", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "paloma-picazuro",
    nombre: "Paloma picazuro",
    cientifico: "Patagioenas picazuro",
    grupo: "Paloma",
    habitat: "Campos abiertos, arboledas y pueblos",
    tamano: "30 a 33 cm",
    alimento: "Semillas y granos que encuentra en el suelo",
    dato: "Tiene escamas blancas en el cuello, como si le hubieran pintado una malla. Anda en bandadas y se la escucha arrullar con un sonido suave y grave.",
    donde: "Campos y plazas; a veces junta bandadas grandes junto a torcazas.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina.",
    epoca: "Residente.",
    color: "#6f6575",
    paleta: {
      cuerpo: "#7d7384", barriga: "#8f8599", ala: "#6a6175", cola: "#635a6e",
      pico: "#413b36", patas: "#b0655e", cabeza: "#897f94", detalle: "#d8d2de", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "gorrion",
    nombre: "Gorrión",
    cientifico: "Passer domesticus",
    grupo: "Semillero",
    habitat: "Ciudades, pueblos y campos junto a las casas",
    tamano: "14 a 16 cm",
    alimento: "Semillas y migas; a los pichones les lleva insectos",
    dato: "El macho tiene la garganta negra y un gorro color castaño. Siempre anda en grupo y charla con un chillido repetido; es el pájaro que vive más cerca de la gente en todo el mundo.",
    donde: "Junto a las casas, los mercados y las plazas.",
    estado: "Preocupación menor (LC)",
    distribucion: "Introducida en todo el mundo; en Argentina en ciudades y pueblos.",
    epoca: "Residente.",
    color: "#8a6a45",
    paleta: {
      cuerpo: "#8a7455", barriga: "#cdc2ae", ala: "#6d5c40", cola: "#665843",
      pico: "#35302a", patas: "#8f7a5e", cabeza: "#83786a", detalle: "#4a4038", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "recto", alas: "plegadas" }
  },
  {
    id: "ratona",
    nombre: "Ratona",
    cientifico: "Troglodytes aedon",
    grupo: "Ave insectívora",
    habitat: "Montes bajos, arbustos y jardines",
    tamano: "11 a 13 cm",
    alimento: "Insectos y arañas",
    dato: "Mide apenas lo que un celular, pero canta fuertísimo. La cola la lleva siempre levantada y la mueve sin parar; a veces entra a las casas a buscar un rincón tranquilo para anidar.",
    donde: "Entre los arbustos; muy común en los jardines.",
    estado: "Preocupación menor (LC)",
    distribucion: "Toda América; en Argentina en todo el país.",
    epoca: "Residente.",
    color: "#8a745a",
    paleta: {
      cuerpo: "#917f65", barriga: "#cbc0ab", ala: "#75654e", cola: "#6f5f49",
      pico: "#574a3b", patas: "#8f7f68", cabeza: "#8a7860", detalle: "#5a4c3a", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "zorzal-patagonico",
    nombre: "Zorzal patagónico",
    cientifico: "Turdus falcklandii",
    grupo: "Zorzal",
    habitat: "Bosques, arboledas y jardines con sombra",
    tamano: "24 a 26 cm",
    alimento: "Frutos, bayas e insectos",
    dato: "Tiene un anillo blanco alrededor del ojo que le resalta la mirada. Come bayas y así ayuda a sembrar árboles lejos de donde nació. Canta una melodía clara al amanecer.",
    donde: "Bosques y plazas de toda la Patagonia; es el más visto del sur.",
    estado: "Preocupación menor (LC)",
    distribucion: "Sur de Argentina y Chile (Patagonia).",
    epoca: "Residente.",
    color: "#574a35",
    paleta: {
      cuerpo: "#6a5c46", barriga: "#a89a83", ala: "#5a4d3a", cola: "#514534",
      pico: "#c29a33", patas: "#b39463", cabeza: "#5c4f3e", detalle: "#4a4032", ojo: "#1a1a1a"
    },
    forma: { cuello: "medio", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
  {
    id: "tordo-renegrido",
    nombre: "Tordo renegrido",
    cientifico: "Molothrus bonariensis",
    grupo: "Tordo",
    habitat: "Campos con ganado, pastizales y junto a los caminos",
    tamano: "19 a 22 cm",
    alimento: "Insectos, semillas y frutos",
    dato: "No hace nido: pone sus huevos en los nidos de otras aves, como la calandria o el naranjero, y ellas le crían a su pichón sin darse cuenta. Por eso se lo llama parásito de cría.",
    donde: "En campos con vacas y ovejas; sigue a los animales para cazar los insectos que espantan.",
    estado: "Preocupación menor (LC)",
    distribucion: "Norte y centro de Argentina.",
    epoca: "Residente.",
    color: "#3a3a46",
    paleta: {
      cuerpo: "#3a3a46", barriga: "#343440", ala: "#303039", cola: "#2c2c36",
      pico: "#26262c", patas: "#45414b", cabeza: "#353540", detalle: "#4e5670", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  },
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
    estado: "Preocupación menor (LC)",
    distribucion: "Sur de Sudamérica, en Argentina hasta Tierra del Fuego.",
    epoca: "Residente.",
    color: "#8a6a3d",
    paleta: {
      cuerpo: "#a8814e", barriga: "#d8bd8e", ala: "#7a5c33", cola: "#6f5430",
      pico: "#5a5a5a", patas: "#c9a227", cabeza: "#96743f", detalle: "#4d3b1f", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "gancho", alas: "plegadas" }
  },
  {
    id: "cotorra",
    nombre: "Cotorra",
    cientifico: "Myiopsitta monachus",
    grupo: "Loro",
    habitat: "Arboledas, parques, montes y hasta postes de luz",
    tamano: "27 a 30 cm",
    alimento: "Semillas y frutos",
    dato: "Es el único loro del mundo que construye su nido con ramitas que corta con el pico. Cada pareja tiene su 'departamento' dentro de un nido comunal que puede pesar como un auto.",
    donde: "En arboledas y ciudades; muy ruidosa cuando anda en grupo.",
    estado: "Preocupación menor (LC)",
    distribucion: "Sur de Sudamérica; en Argentina centro y norte.",
    epoca: "Residente.",
    color: "#6da832",
    paleta: {
      cuerpo: "#79b03d", barriga: "#bcc1c4", ala: "#5d9c48", cola: "#5d9340",
      pico: "#e0782a", patas: "#8f8779", cabeza: "#a0a5aa", detalle: "#4f8fb0", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "ganchudo", alas: "plegadas" }
  },
  {
    id: "paloma-manchada",
    nombre: "Paloma manchada",
    cientifico: "Patagioenas maculosa",
    grupo: "Paloma",
    habitat: "Campos abiertos, rastrojos y pueblos",
    tamano: "28 a 30 cm",
    alimento: "Semillas y granos",
    dato: "El ala está salpicada de manchitas blancas, como pintada a pincel: de ahí su nombre. En los rastrojos se junta en bandadas junto a torcazas y picazuros.",
    donde: "Caminos y campos; muy común en toda la región.",
    estado: "Preocupación menor (LC)",
    distribucion: "Centro y sur de Argentina.",
    epoca: "Residente.",
    color: "#857864",
    paleta: {
      cuerpo: "#8b7e69", barriga: "#a1947c", ala: "#716653", cola: "#685e4d",
      pico: "#44403a", patas: "#a55f55", cabeza: "#908572", detalle: "#e8e2d2", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
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
    estado: "Preocupación menor (LC)",
    distribucion: "Sur de Argentina y Chile (Patagonia).",
    epoca: "Residente.",
    color: "#b5651d",
    paleta: {
      cuerpo: "#8a7f6a", barriga: "#c94f2e", ala: "#6b5c46", cola: "#6b5c46",
      pico: "#4a3c2a", patas: "#c9b896", cabeza: "#5a5240", detalle: "#c9b896", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "golondrina-parda",
    nombre: "Golondrina parda",
    cientifico: "Progne tapera",
    grupo: "Golondrina",
    habitat: "Campos con agua cerca y alambradas",
    tamano: "16 a 18 cm",
    alimento: "Insectos que atrapa volando",
    dato: "Tiene una ancha banda parda en el pecho que la hace fácil de reconocer. A veces ocupa los nidos de barro de otras golondrinas en vez de construir el suyo.",
    donde: "Volando rasante sobre campos y lagunas.",
    estado: "Preocupación menor (LC)",
    distribucion: "Centro y norte de Argentina.",
    epoca: "Migratoria (verano).",
    color: "#7b6a58",
    paleta: {
      cuerpo: "#8b7b67", barriga: "#e8e0d3", ala: "#716352", cola: "#6a5d4c",
      pico: "#302d28", patas: "#454038", cabeza: "#817463", detalle: "#544a3c", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "cabezanegra",
    nombre: "Cabezanegra",
    cientifico: "Spinus magellanicus",
    grupo: "Semillero",
    habitat: "Campos, jardines y arboledas",
    tamano: "12 a 14 cm",
    alimento: "Semillas y algunos brotes tiernos",
    dato: "El macho tiene la cabeza enteramente negra y el cuerpo amarillo: por eso lo llaman cabecitanegra. Anda en bandadas y come semillas colgándose de las espigas, como un acróbata.",
    donde: "Campos y ciudades; en verano forma bandadas muy ruidosas.",
    estado: "Preocupación menor (LC)",
    distribucion: "Sur de Sudamérica.",
    epoca: "Residente.",
    color: "#c9a81a",
    paleta: {
      cuerpo: "#e0c136", barriga: "#e6cf4f", ala: "#3d3833", cola: "#3d3833",
      pico: "#35312c", patas: "#6d6355", cabeza: "#2c2926", detalle: "#e8d24a", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "golondrina-patagonica",
    nombre: "Golondrina patagónica",
    cientifico: "Tachycineta leucorrhoa",
    grupo: "Golondrina",
    habitat: "Cerca de ríos, lagos, costas y pueblos",
    tamano: "12 a 13 cm",
    alimento: "Insectos que caza en vuelo",
    dato: "Tiene una gran mancha blanca en la rabadilla que se le ve en pleno vuelo. Vuela muy cerca del agua y a veces se tumba sobre la superficie para beber sin detenerse.",
    donde: "Sobre ríos, lagos y costas de toda la Patagonia.",
    estado: "Preocupación menor (LC)",
    distribucion: "Centro y sur de Argentina.",
    epoca: "Migratoria (primavera-verano).",
    color: "#4d5b8f",
    paleta: {
      cuerpo: "#4c5c90", barriga: "#f5f3ed", ala: "#3b4870", cola: "#3a4670",
      pico: "#2a2724", patas: "#423d37", cabeza: "#485788", detalle: "#f0eee6", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "corta", pico: "fino", alas: "plegadas" }
  },
  {
    id: "torcaza",
    nombre: "Torcaza",
    cientifico: "Zenaida auriculata",
    grupo: "Paloma",
    habitat: "Campos, montes, pueblos y jardines",
    tamano: "24 a 26 cm",
    alimento: "Semillas y granos que encuentra en el suelo",
    dato: "Es la paloma nativa más común de la Argentina. Su arrullo tranquilo se escucha todo el día en el campo, y los padres le dan a los pichones una sustancia especial del buche, igual que los palomos.",
    donde: "En campos y pueblos; a menudo cruza los caminos volando bajo.",
    estado: "Preocupación menor (LC)",
    distribucion: "Toda América del Sur.",
    epoca: "Residente.",
    color: "#a08066",
    paleta: {
      cuerpo: "#a78b73", barriga: "#c3a38c", ala: "#8b705c", cola: "#826855",
      pico: "#3c352e", patas: "#b06059", cabeza: "#9d8270", detalle: "#2f2b26", ojo: "#1a1a1a"
    },
    forma: { cuello: "corto", patas: "medianas", cresta: false, cola: "larga", pico: "recto", alas: "plegadas" }
  }
];
