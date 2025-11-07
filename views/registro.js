// views/registro.js (Versión antes de cambios posteriores)

function getRegistroView() {
  return `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Registrar Usuario</h1>
    </div>
    
    <div class="space-y-4">
      <button onclick="rol='cliente'; iniciarUsuario()"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
        Soy Cliente
      </button>
      <button onclick="rol='negocio'; iniciarUsuario()"
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
        Soy Negocio
      </button>
    </div>
    <input type="text" id="nombre-usuario" placeholder="Ingresa tu nombre" class="mt-4 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500">
    <button id="btn-guardar" onclick="iniciarUsuario()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md mt-2">
      Crear Usuario
    </button>
  `;
}
