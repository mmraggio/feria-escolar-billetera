// ... (otros imports y código inicial) ...

// === VARIABLES GLOBALES ===
const BANK_ID = "banco-central"; // ID fijo para el banco
let rol = null; // Inicializado como null
let userId = null;
let userData = null;
let usuarios = []; // Lista de comercios para pagar
let unsubscribeUsuarios = null;
let unsubscribeTransacciones = null; // Nuevo: Para escuchar transacciones
let ultimoPagoRecibidoTimestamp = null; // Nuevo: Para rastrear la última transacción vista

// ... (código de inicialización de Firebase) ...

function cargarUsuarioExistente() {
  db.collection("usuarios").doc(userId).get().then(doc => {
    if (doc.exists) {
      userData = doc.data();
      rol = userData.rol; // <-- ASIGNAMOS EL ROL AQUI
      escucharCambios();
      escucharUsuarios();
      escucharTransacciones(); // Iniciar escucha de transacciones
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

// ... (resto del código de logic/main.js, incluyendo escucharTransacciones, mostrarNotificacionPagoRecibido, etc.) ...
