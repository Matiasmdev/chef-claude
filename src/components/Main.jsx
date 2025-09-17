import React, { useEffect, useState, useRef } from "react";
import KitchenQuestion from "./KitchenQuestion";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { getRecipeFromClaude } from "../utils/ai";

// Lista de términos no comestibles
const forbidden = [
  "ladrillo",
  "cemento",
  "clavo",
  "jabón",
  "detergente",
  "lavandina",
  "ropa",
  "zapato",
  "destornillador",
  "martillo",
  "tornillo",
  // objetos cotidianos
  "shampoo",
  "acondicionador",
  "cepillo de dientes",
  "peine",
  // ampliación de elementos de limpieza
  "jabón líquido",
  "jabón en polvo",
  "jabón de manos",
  "detergente líquido",
  "detergente en polvo",
  "suavizante",
  "lejía",
  "blanqueador",
  "amoníaco",
  "vinagre blanco",
  "bicarbonato de sodio",
  "limpiacristales",
  "desengrasante",
  "desinfectante",
  "antiséptico",
  "ambientador",
  "toallitas desinfectantes",
  "spray limpiador multiusos",
  "limpiador de baños",
  "limpiador de inodoros",
  "limpiador de azulejos",
  "limpiador de suelos",
  "limpiador de alfombras",
  "champú para alfombras",
  "quita manchas",
  "pastillas para lavavajillas",
  "abrasivo en crema",
  "pasta abrillantadora",
  "pulidor de muebles",
  "esponja",
  "estropajo",
  "bayeta",
  "paño de microfibra",
  "trapo de algodón",
  "trapo de fibra sintética",
  "mopa",
  "fregona",
  "cubeta",
  "balde",
  "plumero",
  "plumero de plumas",
  "aspiradora",
  "aspiradora industrial",
  "robot aspirador",
  "cepillo de fregar",
  "cepillo de cerdas duras",
  "recogedor",
  "recogedor de polvo",
  "guantes de goma",
  "mascarilla de protección",
  "gafas de protección",
  "bayeta desechable",
  "toalla de papel",
  "rollo de cocina",
  "papel higiénico",
  "pañuelo desechable",
  "spray insecticida",
  "insecticida en polvo",
  "fumigador",
  "limpiacanalones",
  "quitagrasas",
  "limpiador de juntas",
  "limpiador de hornos",
  "limpiador de ollas",
  "limpiacoches",
  "shampoo para coche",
  "limpiador de tapicerías",
  "desoxidante",
  "removedor de pintura",
  "sellador impermeabilizante",
  "descalcificador",
  "limpiador de moho",
  "atarax",
  "peróxido de hidrógeno",
  "alcohol isopropílico",
  "alcohol etílico",
  "acetona",
  "gasolina",
  "disolvente"
];


const Main = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [error, setError] = useState("");
  const [receta, setReceta] = useState("");
  const [loading, setLoading] = useState(false);
  const recetaSection = useRef(null);

  useEffect(() => {
    if (receta && recetaSection.current) {
      recetaSection.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [receta]);

  // Valida que sea un ingrediente de comida
  const isValidIngredient = (ing) => {
    const clean = ing.trim().toLowerCase();
    if (forbidden.includes(clean)) return false;
    // Solo letras y espacios (aprox. evita números y símbolos)
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(clean);
  };

  const agregarIngrediente = (e) => {
    e.preventDefault();
    const ing = newIngredient;

    if (!isValidIngredient(ing)) {
      setError("Escribe algún ingrediente de cocina");
      return;
    }
    setError("");
    setIngredientes((prev) => [...prev, ing.trim()]);
    setNewIngredient("");
  };

  const obtenerReceta = async () => {
    if (ingredientes.length < 4) return;
    setLoading(true);
    try {
      const markdown = await getRecipeFromClaude(ingredientes);
      setReceta(markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`bg-gradient-to-br from-yellow-100 to-yellow-200 flex flex-col items-center p-4 ${
        receta ? "min-h-fit" : "min-h-[calc(100vh-5rem-2rem-0rem)]"
      } overflow-y-auto`}
    >
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl space-y-8">
        <KitchenQuestion />

        <div className="w-full bg-white shadow-lg rounded-xl p-6 transition-all duration-300">
          <form
            onSubmit={agregarIngrediente}
            className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
          >
            <input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              name="ingrediente"
              type="text"
              placeholder="Ejemplo: Orégano"
              aria-label="Agrega ingrediente"
              className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-600 focus:ring-2 focus:ring-green-500 transition font-medium"
            >
              + Agregar
            </button>
          </form>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          <p className="mt-2 text-center text-sm text-gray-700">
            Por favor agrega al menos 4 ingredientes
          </p>

          {ingredientes.length > 0 && (
            <IngredientsList
              ingredientes={ingredientes}
              obtenerReceta={obtenerReceta}
              sectionRef={recetaSection}
            />
          )}

          {loading && (
            <div className="flex flex-col items-center my-4">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-4 border-t-amber-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-700">
                El chef está preparando tu receta...
              </p>
            </div>
          )}

          {receta && (
            <div ref={recetaSection}>
              <ClaudeRecipe receta={receta} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Main;
