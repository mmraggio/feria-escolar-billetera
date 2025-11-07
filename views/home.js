// views/home.js

// --- MODULARIZACIÓN: Funciones para la pantalla principal (home) ---
function getHomeButtons() {
    // Definir botones comunes para todos los roles
    const botonesComunes = [
        {
            texto: "Mi QR",
            icono: "qr_code", // Puedes usar un icono de texto o un SVG aquí
            onClick: "switchView('qr')"
        },
        {
            texto: "Pagar",
            icono: "payment", // Puedes usar un icono de texto o un SVG aquí
            onClick: "switchView('pago')"
        },
        {
            texto: "Transferir",
            icono: "swap_horiz", // Puedes usar un icono de texto o un SVG aquí
            onClick: "switchView('transfer')"
        }
    ];

    // Añadir botón de Generar QR de Cobro solo si es negocio
    if (rol === 'negocio') {
        botonesComunes.push({
            texto: "Generar QR",
            icono: "qr_code_2", // Puedes usar un icono de texto o un SVG aquí
            onClick: "switchView('qrPago')" // <-- CAMBIADO: Ahora va directamente a la vista específica
        });
    }

    // Generar HTML para los botones en una cuadrícula de 2 columnas (2 filas)
    let html = '<div class="grid grid-cols-2 gap-4 max-w-xs mx-auto">'; // Cambiado a 2 columnas
    botonesComunes.forEach(boton => {
        html += `
        <button onclick="${boton.onClick}"
                class="flex flex-col items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
            <span class="text-2xl mb-2">${boton.icono}</span>
            <span>${boton.texto}</span>
        </button>
        `;
    });
    html += '</div>';
    return html;
}

function getHomeView() {
  const formatCurrency = (value) => (value || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    ${getHomeButtons()} <!-- Incluye los botones en cuadrícula -->
  `;
}
