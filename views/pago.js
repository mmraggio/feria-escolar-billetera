// views/pago.js
function getPagoView() {
  const CURRENCY_SYMBOL = '$';
  const formatCurrency = (value) => (value || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const negocioOptions = usuarios.length > 0
    ? usuarios.map(n => `<option value="${n.id}">${n.nombre} (ID: ${n.id})</option>`).join('')
    : '<option value="">No hay negocios disponibles</option>';

  // Botón de escanear QR es común para todos los usuarios
  const escanearButton = `
      <button type="button" onclick="switchView('escanear')" 
              class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
        Escanear QR de Negocio
      </button>
  `;

  return `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Pagar a Negocio</h1>
    </div>

    <div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
      <p class="text-sm font-medium">Tu Saldo: <span class="font-bold">${CURRENCY_SYMBOL}${formatCurrency(userData?.saldo || 0)}</span></p>
    </div>
    
    <form id="pago-form" class="space-y-4">
      <div>
        <label for="negocio-select" class="block text-sm font-medium text-gray-700">Seleccionar Negocio</label>
        <select id="negocio-select" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500">
          <option value="">-- Selecciona un negocio --</option>
          ${negocioOptions}
        </select>
      </div>
      <div>
        <label for="monto-pago" class="block text-sm font-medium text-gray-700">Monto (${CURRENCY_SYMBOL})</label>
        <input type="number" id="monto-pago" placeholder="10.00" required step="0.01" min="0.01"
               class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500">
      </div>
      
      <button type="button" onclick="confirmarPago()" 
              class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
        Pagar Ahora
      </button>
      ${escanearButton}
      <!-- Botón Generar QR de Cobro REMOVIDO de aquí -->
    </form>
  `;
}
