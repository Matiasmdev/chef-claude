import React from "react";

const IngredientsList = ({ ingredientes, obtenerReceta, sectionRef }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-800">Ingredientes a mano:</h2>
    <ul className="list-disc pl-5 space-y-1">
      {ingredientes.length > 0 ? (
        ingredientes.map((ing) => (
          <li
            key={ing}
            className="text-black py-2 px-4 rounded-md mb-1 hover:bg-gray-100 transition duration-200"
          >
            {ing}
          </li>
        ))
      ) : (
        <p className="text-gray-500 italic">No hay ingredientes aún...</p>
      )}
    </ul>

    {ingredientes.length > 3 && (
      <div ref={sectionRef} className="space-y-2 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-700">
          ¿Listo para una nueva receta?
        </h3>
        <p className="text-gray-600 text-sm">
          Crea una nueva receta con tu lista de ingredientes.
        </p>
        <button
          onClick={obtenerReceta}
          className="mt-2 w-full sm:w-auto bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 transition duration-300 font-medium"
        >
          Crear Receta
        </button>
      </div>
    )}
  </section>
);

export default IngredientsList;
