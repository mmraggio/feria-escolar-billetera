// views/qrPago.js

// --- FUNCIÓN ACTUALIZADA getQRPagoView ---
function getQRPagoView() {
    // Verificar si el rol es 'negocio' al cargar la vista
    if (userData?.rol !== 'negocio') {
        // Mostrar un mensaje de error si no es negocio
        return `
        <div class="flex items-center mb-6">
          <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-800">Generar QR de Cobro</h1>
        </div>
        <div class="text-center p-6">
            <p class="text-red-500 font-bold text-lg">Acceso Denegado</p>
            <p class="text-gray-700 mt-2">Solo los negocios pueden generar QR de cobro.</p>
            <button onclick="switchView('home')"
                    class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
              Volver al Inicio
            </button>
        </div>
        `;
    }

    // Si es negocio, mostrar la interfaz normal
    const nombreUsuario = userData?.nombre || 'Usuario (ID Desconocido)';
    const rolUsuario = userData?.rol || 'Desconocido';

    // HTML para el formulario de generación de QR
    const qrFormHtml = `
        <div class="mb-6">
            <label for="monto-generar-qr" class="block text-sm font-medium text-gray-700">Monto a Cobrar (${CURRENCY_SYMBOL})</label>
            <input type="number" id="monto-generar-qr" placeholder="10.00" required step="0.01" min="0.01"
                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500">
        </div>
        <button type="button" onclick="generarQRPagoDesdeFormulario()" 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
          Generar QR de Cobro
        </button>
    `;

    // Contenedor para el QR generado (inicialmente vacío)
    const qrContainerHtml = `<div id="qr-pago-container" class="flex justify-center p-4 border border-gray-200 rounded-lg bg-white mt-4 hidden"></div>`;
    // Contenedor para el mensaje de estado (inicialmente vacío)
    const statusMessageHtml = `<div id="qr-pago-status" class="text-center mt-2 text-sm"></div>`;

    const html = `
    <div class="flex items-center mb-6">
      <button onclick="switchView('home')" class="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Generar QR de Cobro</h1>
    </div>

    <!-- Display de Saldo y Rol -->
    <div class="bg-indigo-100 p-4 rounded-xl mb-6 text-center shadow-inner">
      <p class="text-sm font-medium text-indigo-700">Tu Rol: ${rolUsuario}</p>
      <p class="text-sm font-medium text-indigo-700">Tu Saldo:</p>
      <p class="text-2xl font-black text-indigo-900 currency-display">
        ${CURRENCY_SYMBOL}${formatCurrency(userData?.saldo || 0)}
      </p>
      <p class="text-xs text-gray-500 mt-2">ID: <span class="font-mono break-all">${userId || 'N/A'}</span></p>
    </div>

    <!-- Formulario para generar QR -->
    <form id="generar-qr-form" class="space-y-4">
      ${qrFormHtml}
    </form>

    <!-- Contenedor del QR generado -->
    ${qrContainerHtml}
    <!-- Mensaje de estado -->
    ${statusMessageHtml}
  `;
  return html;
}

// --- Actualización de la vista QR de Pago ---
function updateQRPagoView() {
  // Limpiar el contenedor del QR y el mensaje de estado al cargar la vista
  // Solo si es un negocio (para evitar errores si no lo es)
  if (userData?.rol === 'negocio') {
      const container = document.getElementById('qr-pago-container');
      const statusDiv = document.getElementById('qr-pago-status');
      if (container) {
          container.innerHTML = ''; // Limpiar
          container.classList.add('hidden'); // Ocultar
      }
      if (statusDiv) {
          statusDiv.textContent = ''; // Limpiar mensaje
          statusDiv.className = "text-center mt-2 text-sm"; // Resetear clase
      }
  }
}

// --- Nueva función para generar QR desde el formulario ---
function generarQRPagoDesdeFormulario() {
    // Verificar si el rol es 'negocio' otra vez, por si acaso
    if (userData?.rol !== 'negocio') {
        showMessage("Solo los negocios pueden generar QR de cobro.", 'error');
        return; // Salir si no es negocio
    }

    const amountInput = document.getElementById('monto-generar-qr').value;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
        showMessage("Ingresa un monto válido para generar el cobro.", 'error');
        return;
    }

    // El receptor es el propio negocio (userId)
    const receiverId = userId;

    // Guardar temporalmente los datos del pago (el negocio como receptor)
    // Opcional: Podrías no necesitar tempPagoData aquí si generas el QR directamente
    // window.tempPagoData = { receiverId, amount }; // Comentado si no se usa

    // Actualizar el mensaje de estado
    const statusDiv = document.getElementById('qr-pago-status');
    if (statusDiv) {
        statusDiv.textContent = `Generando QR para cobrar $${amount.toFixed(2)}...`;
        statusDiv.className = "text-center mt-2 text-sm text-yellow-600"; // Color amarillo para "cargando"
    }

    // Generar el QR inmediatamente después de guardar los datos
    // Usamos un pequeño timeout para asegurar que el DOM se actualice con el mensaje
    setTimeout(() => {
        const container = document.getElementById('qr-pago-container');
        if (container) {
            container.innerHTML = ''; // Limpiar por si acaso
            container.classList.remove('hidden'); // Mostrar contenedor

            const qrContent = `${receiverId},${amount.toFixed(2)}`;

            try {
                // Generar QR con la nueva sintaxis
                new QRCode(container, {
                  text: qrContent, // Contenido: ID_USUARIO,MONTO
                  width: 200,
                  height: 200,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
                });
                console.log('QR de Pago generado correctamente para cobro.');

                // Actualizar mensaje de éxito
                const statusDiv = document.getElementById('qr-pago-status');
                if (statusDiv) {
                    statusDiv.textContent = `✅ QR generado para cobrar $${amount.toFixed(2)}.`;
                    statusDiv.className = "text-center mt-2 text-sm text-green-600"; // Color verde para éxito
                }

            } catch (error) {
                console.error('Error al generar QR de pago:', error);
                const statusDiv = document.getElementById('qr-pago-status');
                if (statusDiv) {
                    statusDiv.textContent = "Error al generar el QR.";
                    statusDiv.className = "text-center mt-2 text-sm text-red-600"; // Color rojo para error
                }
            }
        } else {
             console.error('Contenedor QR Pago no encontrado en generarQRPagoDesdeFormulario.');
             showMessage("Error al generar el QR.", 'error');
        }
    }, 100); // Pequeño delay para que se vea el mensaje de "cargando"
}

// Mantenemos la función original generarQRPago por si acaso, pero ahora llama a la nueva
function generarQRPago() {
    // Esta función ahora llama a la nueva lógica
    generarQRPagoDesdeFormulario();
}

// Función auxiliar para formatear moneda, por si acaso no está definida globalmente
function formatCurrency(value) {
  return (value || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const CURRENCY_SYMBOL = '$';
