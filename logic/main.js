// --- CARGAR DATOS DESPUÉS DE RENDERIZAR PAGO ---
// Esta función se llama desde renderApp DESPUÉS de que el HTML de pago esté en el DOM
function cargarDatosEscaneados() {
    if (window.tempScannedData) {
        const { negocioId, monto } = window.tempScannedData;
        const negocio = usuarios.find(u => u.id === negocioId);

        if (negocio) {
            const negocioSelect = document.getElementById('negocio-select');
            const montoInput = document.getElementById('monto-pago');

            if (negocioSelect && montoInput) {
                negocioSelect.value = negocioId;
                montoInput.value = monto.toFixed(2);
                console.log("Datos cargados desde escaneo:", negocioId, monto.toFixed(2));
                // Opcional: Mostrar mensaje de éxito al usuario
                // showMessage(`Datos cargados: ${negocio.nombre}, $${monto.toFixed(2)}`, 'success');
            } else {
                console.error("Campos de pago no encontrados para cargar datos escaneados.");
                // Opcional: Mostrar mensaje al usuario
                showMessage("Error: No se pudieron cargar los datos escaneados.", 'error');
            }
        } else {
            console.error("Negocio escaneado no encontrado en lista actual:", negocioId);
            showMessage("Error: Negocio no encontrado.", 'error');
        }
        // Limpiar datos temporales después de usarlos
        delete window.tempScannedData;
    }
}

// Aseguramos que se llame a cargarDatosEscaneados después de renderizar la vista de pago
const originalRenderApp = renderApp;
window.renderApp = () => {
    originalRenderApp();
    if (currentView === 'pago') {
        // Usamos setTimeout para asegurar que el DOM se haya actualizado completamente
        setTimeout(cargarDatosEscaneados, 0);
    }
};

// --- FUNCIONES DE PROCESO ---

function processPayment() {
  // ... (mismo código que antes)
}

// Nueva función para transferencia entre usuarios
async function processTransfer(event) {
  // ... (mismo código que antes)
}

// Nueva función para generar QR de pago (solo para negocio)
function generarQRPago() {
  // ... (mismo código que antes)
}

// Función para confirmar pago directamente
function confirmarPago() {
  processPayment();
}

// Función global para mostrar mensajes
window.showMessage = (text, type) => {
  message = { text, type };
  // Forzar renderizado para mostrar el mensaje inmediatamente si es posible
  if (document.getElementById('app-container')) renderApp();
};
