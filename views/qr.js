// views/qr.js (Versión antes de cambios posteriores)

function getQRView() {
  const qrContainer = document.createElement("div");
  new QRCode(qrContainer, userId);
  const qrCodeHtml = qrContainer.innerHTML;

  return `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Mi Código QR</h1>
    </div>
    <div class="text-center p-4">
      <h3 class="text-lg font-semibold">${userData?.nombre || 'Desconocido'}</h3>
      <p class="text-sm text-gray-500 mb-4">ID: ${userId}</p>
      <div class="flex justify-center">${qrCodeHtml}</div>
      <p class="mt-4 text-sm text-gray-600">Otro usuario puede escanear este código para transferirte dinero.</p>
    </div>
  `;
}
