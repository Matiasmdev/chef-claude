import React from "react";
import ReactMarkdown from "react-markdown";

const ClaudeRecipe = ({ receta }) => {
  if (typeof receta !== "string") {
    return (
      <section className="p-6 bg-red-50 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-4">
          Error al mostrar la receta
        </h2>
        <p className="text-red-600">
          Se esperaba un texto en Markdown, pero se recibió un tipo{' '}
          <code className="bg-gray-200 px-1 rounded">{typeof receta}</code>.
          Revisa tu función{' '}
          <code className="bg-gray-200 px-1 rounded">getRecipeFromClaude</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 bg-yellow-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        El Chef Claude Recomienda:
      </h2>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-center">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-4 mb-2">{children}</h2>
          ),
          p: ({ children }) => <p className="text-gray-700 mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside pl-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="text-gray-900">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="bg-gray-200 px-1 rounded">{children}</code>
          ),
        }}
      >
        {receta}
      </ReactMarkdown>
    </section>
  );
};

export default ClaudeRecipe;