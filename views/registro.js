function getRegistroView() {
  return `
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registrar Usuario</h1>
    
    <div class="space-y-4">
      <input type="text" id="nombre-usuario" placeholder="Ingresa tu nombre o negocio" 
              class="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500">
      
      <button id="rol-cliente-btn" onclick="rol='cliente'; this.classList.add('ring-4', 'ring-green-400'); document.getElementById('rol-negocio-btn').classList.remove('ring-4', 'ring-indigo-400')"
              class="w-full bg-green-100 text-green-800 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 hover:bg-green-200">
        Soy Cliente (Recibo $500 iniciales)
      </button>
      <button id="rol-negocio-btn" onclick="rol='negocio'; this.classList.add('ring-4', 'ring-indigo-400'); document.getElementById('rol-cliente-btn').classList.remove('ring-4', 'ring-green-400')"
              class="w-full bg-indigo-100 text-indigo-800 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 hover:bg-indigo-200">
        Soy Negocio (Recibo $0 iniciales)
      </button>
    </div>
    <button id="btn-guardar" onclick="iniciarUsuario()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md mt-6">
      Guardar y Entrar
    </button>
  `;
}
