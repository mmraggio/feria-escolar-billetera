// === 🔥 CONFIGURACIÓN DE FIREBASE (YA CONFIGURADA) ===
const firebaseConfig = {
  apiKey: "AIzaSyDbxqbqjn8ZdCzLUNWyuM2gNMTtVw_-zcI",
  authDomain: "feria-escolar-billetera.firebaseapp.com",
  projectId: "feria-escolar-billetera",
  storageBucket: "feria-escolar-billetera.firebasestorage.app",
  messagingSenderId: "311026746803",
  appId: "1:311026746803:web:fc891c988b9da3faee37c6"
};

let db = null;
let app = null;

// Inicializar Firebase
try {
  app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (e) {
  console.error("Error al inicializar Firebase:", e);
  document.getElementById("app-container").innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="p-8 text-center bg-red-100 text-red-800 rounded-lg max-w-xs w-full">
        Error: No se pudo inicializar Firebase. Revisa la consola.
      </div>
    </div>
  `;
}

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

// === CREAR BANCO SI NO EXISTE ===
async function setupBanco() {
  const bancoRef = db.collection("usuarios").doc(BANK_ID);
  const doc = await bancoRef.get();

  if (!doc.exists) {
    await bancoRef.set({
      nombre: "Banco Nacional",
      rol: "banco",
      saldo: 1000000, // Saldo inicial
      qrId: BANK_ID,
      createdAt: new Date()
    });
    console.log("Banco Nacional creado automáticamente.");
  }
}

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

function mostrarFormulario() {
  switchView('registro');
}

// === FUNCIÓN CORREGIDA PARA INICIAR USUARIO ===
async function iniciarUsuario() {
  const btn = document.getElementById("btn-guardar");
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = "Creando usuario...";

  const nombreInput = document.getElementById("nombre-usuario");
  const nombre = nombreInput.value.trim();
  if (!nombre) {
    showMessage("Ingresa un nombre", 'error');
    btn.disabled = false;
    btn.textContent = "Guardar y Entrar";
    return;
  }
  if (!rol) {
    showMessage("Selecciona un rol (Cliente o Negocio)", 'error');
    btn.disabled = false;
    btn.textContent = "Guardar y Entrar";
    return;
  }


  // Buscar un ID disponible (4 dígitos) de forma síncrona
  let nuevoId = null;
  let intentos = 1; // Empezar en 1 para evitar 0000

  while (nuevoId === null && intentos < 10000) {
    const id = String(intentos).padStart(4, '0');
    intentos++;
    const docRef = db.collection("usuarios").doc(id);

    try {
      const doc = await docRef.get();
      if (!doc.exists) {
        nuevoId = id;

        await docRef.set({
          nombre,
          rol,
          saldo: rol === 'cliente' ? 500 : 0,
          qrId: id,
          createdAt: new Date()
        });

        localStorage.setItem("userId", id);
        userId = id;
        userData = { nombre, rol, saldo: rol === 'cliente' ? 500 : 0 };
        escucharCambios();
        escucharUsuarios();
        escucharTransacciones(); // <-- Agregamos esta línea
        showMessage(`Usuario ${nombre} (${id}) creado como ${rol}.`, 'success');
        switchView('home');
        break; // Salir del bucle una vez creado
      }
    } catch (e) {
      console.error("Error al crear usuario:", e);
      showMessage("Hubo un error al crear el usuario. Inténtalo de nuevo.", 'error');
      btn.disabled = false;
      btn.textContent = "Guardar y Entrar";
      return;
    }
  }

  if (!nuevoId) {
    showMessage("No se pudo asignar un ID (Máximo de 9999 usuarios).", 'error');
    btn.disabled = false;
    btn.textContent = "Guardar y Entrar";
  }
}

function escucharCambios() {
  if (unsubscribeUsuarios) unsubscribeUsuarios();
  unsubscribeUsuarios = db.collection("usuarios").doc(userId).onSnapshot(doc => {
    userData = doc.data();
    // Solo refrescar vistas que lo necesiten
    if (currentView === 'home' || currentView === 'pago' || currentView === 'transfer') renderApp();
  });
}

function escucharUsuarios() {
  // Escucha solo negocios (y el banco si es necesario, pero lo filtramos luego)
  db.collection("usuarios").onSnapshot(snap => {
    usuarios = [];
    snap.forEach(doc => {
      const data = doc.data();
      // Solo incluimos negocios en la lista de pago, excluyendo el banco
      if (data.rol === 'negocio' && doc.id !== BANK_ID) {
        usuarios.push({ id: doc.id, ...data });
      }
    });
    if (currentView === 'pago') renderApp();
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


// --- FUNCIONES DE PROCESO ---

async function processPayment() {
  // No necesitamos el evento aquí
  
  const receiverId = document.getElementById('negocio-select').value;
  const montoInput = document.getElementById('monto-pago');
  const montoInputValue = montoInput.value; // Guardamos el valor antes de resetear
  const amount = parseFloat(montoInputValue);

  if (!receiverId || isNaN(amount) || amount <= 0) {
    showMessage("Selecciona un negocio y un monto válido.", 'error');
    return;
  }
  if (amount > (userData?.saldo || 0)) {
    showMessage(`Saldo insuficiente. Tu saldo es $${(userData.saldo || 0).toFixed(2)}.`, 'error');
    return;
  }

  const senderRef = db.collection("usuarios").doc(userId);
  const receiverRef = db.collection("usuarios").doc(receiverId);
  const bancoRef = db.collection("usuarios").doc(BANK_ID); // Referencia al banco
  const transaccionRef = db.collection("transacciones").doc();

  // Antes de la transacción, reseteamos el formulario para limpiar los campos
  document.getElementById('pago-form').reset();
  // Opcional: Limpiar también el select si es necesario, aunque mantenerlo puede ser útil
  // document.getElementById('negocio-select').value = ''; 

  try {
    await db.runTransaction(async (t) => {
      const senderDoc = await t.get(senderRef);
      const receiverDoc = await t.get(receiverRef);
      const bancoDoc = await t.get(bancoRef);

      if (!senderDoc.exists || !receiverDoc.exists || !bancoDoc.exists) throw "Usuario no encontrado";

      // Cálculo de comisión que aplica al *receptor* si es un negocio
      const isReceiverBusiness = receiverDoc.data().rol === 'negocio';
      const comisionNegocio = isReceiverBusiness ? amount * 0.05 : 0;
      const montoFinalNegocio = amount - comisionNegocio; // Lo que el negocio realmente recibe

      // Actualizaciones
      const newSenderBalance = senderDoc.data().saldo - amount;
      const newReceiverBalance = receiverDoc.data().saldo + montoFinalNegocio;
      const newBancoBalance = bancoDoc.data().saldo + comisionNegocio;

      t.update(senderRef, { saldo: newSenderBalance });
      t.update(receiverRef, { saldo: newReceiverBalance });
      t.update(bancoRef, { saldo: newBancoBalance }); 

      t.set(transaccionRef, {
        tipo: "pago_negocio",
        emisor: userId,
        receptor: receiverId,
        monto_total: amount,
        comision: comisionNegocio,
        monto_recibido: montoFinalNegocio,
        fecha: new Date(),
      });
    });

    // Mensaje de éxito (ya se limpió el formulario antes de la transacción)
    showMessage(`✅ Pago de $${amount.toFixed(2)} realizado con éxito.`, 'success');
    // Esperar un momento corto para que se vea el mensaje
    setTimeout(() => {
        switchView('home');
    }, 1000); // Espera 1 segundo antes de cambiar de vista

  } catch (e) {
      console.error("Error en processPayment:", e);
      // Si la transacción falla, restauramos los valores originales en los campos (opcional)
      // montoInput.value = montoInputValue; // Si no se reseteó antes
      showMessage(`Error al procesar el pago.`, 'error');
  }
}

// Nueva función para transferencia entre usuarios
async function processTransfer(event) {
  event.preventDefault();
  
  const receiverId = document.getElementById('destinatario-id').value.trim();
  const amount = parseFloat(document.getElementById('monto-transfer').value);

  if (!receiverId || isNaN(amount) || amount <= 0 || !receiverId.match(/^\d{4}$/)) {
    showMessage("Ingresa un ID de 4 dígitos y un monto válido.", 'error');
    return;
  }
  if (receiverId === userId) {
    showMessage("No puedes transferirte dinero a ti mismo.", 'error');
    return;
  }
  if (amount > (userData?.saldo || 0)) {
    showMessage(`Saldo insuficiente. Tu saldo es $${(userData.saldo || 0).toFixed(2)}.`, 'error');
    return;
  }

  const senderRef = db.collection("usuarios").doc(userId);
  const receiverRef = db.collection("usuarios").doc(receiverId);
  const transaccionRef = db.collection("transacciones").doc();

  try {
    // No hay comisión para transferencias entre usuarios
    await db.runTransaction(async (t) => {
      const senderDoc = await t.get(senderRef);
      const receiverDoc = await t.get(receiverRef);

      if (!senderDoc.exists) throw "Emisor no encontrado";
      if (!receiverDoc.exists) throw `Destinatario (ID: ${receiverId}) no encontrado.`;

      const newSenderBalance = senderDoc.data().saldo - amount;
      const newReceiverBalance = receiverDoc.data().saldo + amount;

      t.update(senderRef, { saldo: newSenderBalance });
      t.update(receiverRef, { saldo: newReceiverBalance });
      t.set(transaccionRef, {
        tipo: "transferencia_p2p",
        emisor: userId,
        receptor: receiverId,
        monto: amount,
        comision: 0,
        fecha: new Date(),
      });
    });

    document.getElementById('monto-transfer').value = '';
    showMessage(`✅ Transferencia de $${amount.toFixed(2)} a ${receiverId} exitosa.`, 'success');
    // Esperar un momento para que se vea el mensaje
    setTimeout(() => {
        switchView('home');
    }, 1500); // Espera 1.5 segundos antes de cambiar de vista
  } catch (e) {
    const errorMsg = typeof e === 'string' ? e : "Error desconocido al transferir.";
    console.error("Error en processTransfer:", e);
    showMessage(`Error: ${errorMsg}`, 'error');
  }
}

// Nueva función para generar QR de pago (solo para negocio)
function generarQRPago() {
    if (rol !== 'negocio') {
        showMessage("Solo los negocios pueden generar QR de cobro.", 'error');
        return;
    }
    const receiverId = userId; // El negocio es el receptor
    const amountInput = document.getElementById('monto-pago').value;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
        showMessage("Ingresa un monto válido para generar el cobro.", 'error');
        return;
    }

    // Guardar temporalmente los datos del pago (el negocio como receptor)
    window.tempPagoData = { receiverId, amount };
    switchView('qrPago');
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

// --- CARGAR DATOS DESPUÉS DE RENDERIZAR PAGO ---
// Esta función se llama desde renderApp DESPUÉS de que el HTML de pago esté en el DOM
// (Esta función ya estaba definida arriba, pero la dejamos aquí por si acaso)
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
