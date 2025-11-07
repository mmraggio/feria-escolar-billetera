// views/home.js (Versión antes de cuadrícula de iconos)

function getHomeButtons() {
    // Versión lineal original
    return `
        <div class="space-y-4">
          <button onclick="switchView('pago')"
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-500/50">
            Pagar a un Negocio
          </button>
          <button onclick="switchView('qr')"
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
            Mi QR (Para recibir)
          </button>
          <!-- Botón de Transferencia entre Usuarios -->
          <button onclick="switchView('transfer')"
                  class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gray-500/50">
            Transferir a Usuario
          </button>
        </div>
    `;
}

function getHomeView() {
  const formatCurrency = (value) => value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const CURRENCY_SYMBOL = '$';

  return `
    <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Feria Escolar - Billetera</h1>
    
    <!-- Display de Saldo -->
    <div class="bg-indigo-100 p-4 rounded-xl mb-6 text-center shadow-inner">
      <p class="text-sm font-medium text-indigo-700">Tu Saldo (Rol: ${userData?.rol || 'Desconocido'})</p>
      <p class="text-4xl font-black text-indigo-900 currency-display">
        ${CURRENCY_SYMBOL}${formatCurrency(userData?.saldo || 0)}
      </p>
      <p class="text-xs text-gray-500 mt-2">ID: <span class="font-mono break-all">${userId || 'N/A'}</span></p>
    </div>

    ${getHomeButtons()} <!-- Incluye los botones lineales -->
    <div id="app-message" style="opacity:0;" class="mt-4 text-center"></div>
  `;
}
