import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          headers: { "x-secret-key": process.env.SECRET_FRONTEND_KEY }
        });

        if (!res.ok) throw new Error("No autorizado o error al cargar dashboard");

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Cargando dashboard...</p>;

  return (
    <section className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-2">Dashboard de recetas</h2>
      <p>Total recetas generadas: {data.totalRecipes}</p>
      <h3 className="mt-2 font-semibold">Recetas por usuario:</h3>
      <ul className="list-disc pl-5">
        {Object.entries(data.recipesByUser).map(([user, count]) => (
          <li key={user}>{user}: {count}</li>
        ))}
      </ul>
      <h3 className="mt-2 font-semibold">Últimos logs:</h3>
      <ul className="list-disc pl-5">
        {data.lastLogs.map((log, i) => (
          <li key={i}>
            {log.userId} - {new Date(log.timestamp).toLocaleString()} - Ingredientes usados: {log.ingredients.join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Dashboard;
