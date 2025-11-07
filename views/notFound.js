// views/notFound.js (Versión antes de cambios posteriores)

function getNotFoundView() {
  return `
    <div class="text-center p-10">
      <h1 class="text-4xl font-bold text-red-600 mb-4">Error 404</h1>
      <p class="text-gray-600">Vista no encontrada.</p>
      <button onclick="switchView('home')" class="mt-6 text-indigo-600 hover:text-indigo-800 underline">
        Volver al inicio
      </button>
    </div>
  `;
}
