// ... (otros imports y código inicial) ...

// === VARIABLES GLOBALES ===
const BANK_ID = "banco-central"; // ID fijo para el banco
let rol = null;
let userId = null;
let userData = null;
let usuarios = []; // Lista de comercios para pagar
let unsubscribeUsuarios = null;
let unsubscribeTransacciones = null; // Nuevo: Para escuchar transacciones
let ultimoPagoRecibidoTimestamp = null; // Nuevo: Para rastrear la última transacción vista

// === CARGAR DATOS AL ABRIR ===
window.onload = () => {
  if (!db) return; // Si Firebase no se inicializó, no hacer nada

  // Crear banco si no existe
  setupBanco().then(() => {
    const savedId = localStorage.getItem("userId");
    if (savedId) {
      userId = savedId;
      cargarUsuarioExistente();
    } else {
      mostrarFormulario();
    }
  }).catch(e => {
    console.error("Error al crear banco:", e);
    showMessage("Error al inicializar banco.", 'error');
  });
};

// ... (funciones setupBanco, cargarUsuarioExistente, mostrarFormulario, iniciarUsuario, escucharCambios, escucharUsuarios) ...

function cargarUsuarioExistente() {
  db.collection("usuarios").doc(userId).get().then(doc => {
    if (doc.exists) {
      userData = doc.data();
      rol = userData.rol;
      escucharCambios();
      escucharUsuarios();
      escucharTransacciones(); // <-- Agregamos esta línea
      switchView('home');
    } else {
      showMessage("Usuario no encontrado. Reinicia la app.", 'error');
      localStorage.removeItem("userId");
      mostrarFormulario();
    }
  }).catch(e => {
    console.error("Error al cargar usuario:", e);
    showMessage("Error al cargar usuario.", 'error');
  });
}

// --- ESCUCHAR TRANSACCIONES ---
function escucharTransacciones() {
  if (unsubscribeTransacciones) {
    unsubscribeTransacciones(); // Detener listener anterior si existe
  }

  if (!userId) {
    console.error("No se puede escuchar transacciones: userId no está definido.");
    return;
  }

  // Escuchar transacciones donde el receptor es el usuario actual y es un pago a negocio
  unsubscribeTransacciones = db.collection("transacciones")
    .where("receptor", "==", userId)
    .where("tipo", "==", "pago_negocio")
    .orderBy("fecha", "desc") // Ordenar por fecha descendente
    .limit(1) // Solo la más reciente
    .onSnapshot(snap => {
      if (!snap.empty) {
        const doc = snap.docs[0];
        const transaccion = doc.data();
        const transaccionFecha = transaccion.fecha?.toDate ? transaccion.fecha.toDate() : new Date(0); // Convertir Timestamp a Date

        // Solo procesar si es una transacción más reciente que la última vista
        if (!ultimoPagoRecibidoTimestamp || transaccionFecha.getTime() > ultimoPagoRecibidoTimestamp.getTime()) {
          ultimoPagoRecibidoTimestamp = transaccionFecha;

          // Actualizar userData para reflejar el nuevo saldo inmediatamente (opcional, dependiendo de la UI)
          // userData.saldo = transaccion.monto_recibido + (userData.saldo || 0); // Ajuste simple, puede no reflejar comisiones correctamente si no se refresca el usuario

          // Mostrar notificación si estamos en la vista qrPago o home (para negocio)
          if (currentView === 'qrPago' && rol === 'negocio') {
            mostrarNotificacionPagoRecibido(transaccion);
          }
          // Opcional: Mostrar notificación global en home del negocio
          if (currentView === 'home' && rol === 'negocio') {
             // Puedes usar showMessage o una notificación específica
             showMessage(`✅ Pago recibido de $${transaccion.monto_recibido.toFixed(2)} (ID: ${transaccion.emisor}).`, 'success');
          }

          console.log("Nuevo pago recibido:", transaccion);
        }
      }
    }, error => {
       console.error("Error escuchando transacciones: ", error);
    });
}

// --- MOSTRAR NOTIFICACIÓN EN VISTA QR PAGO ---
function mostrarNotificacionPagoRecibido(transaccion) {
  const statusDiv = document.getElementById('qr-pago-status');
  if (statusDiv) {
    // Buscar nombre del emisor (cliente) si es posible
    const emisorId = transaccion.emisor;
    const emisor = usuarios.find(u => u.id === emisorId) || { nombre: 'Cliente (ID Desconocido)' };
    const nombreCliente = emisor.nombre;

    statusDiv.textContent = `✅ Pago recibido de ${nombreCliente} ($${transaccion.monto_recibido.toFixed(2)}).`;
    statusDiv.className = "text-center mt-2 text-sm text-green-600"; // Cambiar color a verde para éxito
    // Opcional: Resetear el mensaje después de unos segundos
    // setTimeout(() => {
    //   if (currentView === 'qrPago') { // Asegurarse que siga en qrPago
    //     const currentStatus = document.getElementById('qr-pago-status');
    //     if (currentStatus) {
    //       currentStatus.textContent = ''; // Limpiar mensaje
    //       currentStatus.className = "text-center mt-2 text-sm"; // Resetear clase
    //     }
    //   }
    // }, 5000); // 5 segundos
  }
}

// ... (resto de las funciones como estaban, incluyendo las de vistas y procesos) ...
