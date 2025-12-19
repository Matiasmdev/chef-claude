// KitchenQuestion.jsx
const KitchenQuestion = () => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.4em] text-amber-500 font-black">
        AI Kitchen Engine
      </div>
      <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 text-center tracking-tight leading-tight">
        Cocinemos algo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Legendario</span>
      </h2>
      <p className="text-gray-400 text-center max-w-md text-sm sm:text-base font-medium">
        Dime qué ingredientes tienes y mi inteligencia culinaria diseñará la receta perfecta para ti.
      </p>
    </div>
  );
};

export default KitchenQuestion;