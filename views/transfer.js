// views/transfer.js (Versión antes de cambios posteriores)

function getTransferView() {
    return `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Transferir Dinero</h1>
    </div>

    <div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
      <p class="text-sm font-medium">Tu Saldo: <span class="font-bold">$${userData?.saldo?.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span></p>
    </div>

    <form onsubmit="processTransfer(event)" class="space-y-4">
      <div>
        <label for="destinatario-id" class="block text-sm font-medium text-gray-700">ID del Destinatario (4 dígitos)</label>
        <input type="text" id="destinatario-id" placeholder="Ej: 0045" required pattern="^\d{4}$" maxlength="4"
               class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 font-mono focus:ring-green-500 focus:border-green-500">
      </div>
      <div>
        <label for="monto-transfer" class="block text-sm font-medium text-gray-700">Monto ($)</label>
        <input type="number" id="monto-transfer" placeholder="10.00" required step="0.01" min="0.01"
               class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500">
      </div>
      
      <button type="submit"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
        Transferir Dinero (Sin Comisión)
      </button>
    </form>
  `;
}
