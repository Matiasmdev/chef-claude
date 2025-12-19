import React, { useEffect, useState, useRef } from "react";
import KitchenQuestion from "./KitchenQuestion";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { getRecipeFromClaude } from "../utils/ai";
import { v4 as uuidv4 } from "uuid";

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
  const [errorHeader, setErrorHeader] = useState("");
  const [receta, setReceta] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorApi, setErrorApi] = useState("");
  const [userId, setUserId] = useState(null);
  const recetaSection = useRef(null);

  // Generar o cargar userId
  useEffect(() => {
    let storedId = localStorage.getItem("userId");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("userId", storedId);
    }
    setUserId(storedId);
  }, []);


  // Valida que sea un ingrediente de cocina
  const isValidIngredient = (ing) => {
    const clean = ing.trim().toLowerCase();
    if (forbidden.includes(clean)) return false;
    // Solo letras y espacios
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(clean);
  };

  const agregarIngrediente = (e) => {
    e.preventDefault();
    const ing = newIngredient;

    if (!isValidIngredient(ing)) {
      setErrorHeader("Escribe algún ingrediente de cocina");
      return;
    }
    setErrorHeader("");
    setIngredientes((prev) => [...prev, ing.trim()]);
    setNewIngredient("");
  };

  const resetRecipe = () => {
    setIngredientes([]);
    setReceta("");
    setErrorApi("");
    setNewIngredient("");
  };

  const obtenerReceta = async (refresh = false) => {
    if (ingredientes.length < 4 || !userId) return;
    setLoading(true);
    setErrorApi("");

    try {
      // ReCAPTCHA token (v3)
      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA no cargado correctamente");
      }

      const recaptchaToken = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: "generate_recipe" }
      );

      const data = await getRecipeFromClaude({
        ingredients: ingredientes,
        userId,
        recaptchaToken,
        refresh
      });

      setReceta(data.receta);
    } catch (err) {
      console.error(err);
      setErrorApi(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-4 sm:p-8 pt-24 pb-32 animate-fade-in min-h-screen">
      <div className="flex flex-col items-center w-full max-w-2xl space-y-12 mb-12">
        <div className="animate-float">
          <KitchenQuestion />
        </div>

        <div className="w-full glass-morphism rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:border-white/20">
          <div className="flex flex-col space-y-2 mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Panel de Ingredientes</h2>
            <p className="text-sm text-gray-400">¿Qué tenemos en la heladera hoy?</p>
          </div>

          <form
            onSubmit={agregarIngrediente}
            className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
          >
            <div className="relative flex-1 group">
              <input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                name="ingrediente"
                type="text"
                placeholder="Ej. Orégano, Pollo, Queso..."
                aria-label="Agrega ingrediente"
                className="w-full bg-white/5 border border-white/10 p-4 pl-5 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white/10 transition-all duration-300 placeholder-white/20 text-white"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-50 transition-opacity">
                🍳
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl glow-amber shadow-lg active:scale-95 transition-all duration-200 font-bold flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">+</span>
              Agregar
            </button>
          </form>

          {errorHeader && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center font-medium">⚠️ {errorHeader}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px bg-white/5 flex-1"></div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
              Mínimo 4 ingredientes
            </p>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>

          {ingredientes.length > 0 && (
            <div className="mt-10 animate-fade-in">
              <IngredientsList
                ingredientes={ingredientes}
                obtenerReceta={obtenerReceta}
                resetRecipe={resetRecipe}
                loading={loading}
                errorApi={errorApi}
                receta={receta}
                recetaRef={recetaSection}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Main;
