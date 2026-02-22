const admin = require('firebase-admin');
const fs = require('fs');
const XLSX = require('xlsx');

// 1. CARGA DE CREDENCIALES
// Busca el archivo 'creds.json' en la misma carpeta
const credsPath = './creds.json';

if (!fs.existsSync(credsPath)) {
    console.error('\n🔴 ERROR: No se encontró el archivo "creds.json".');
    console.error('👉 Por favor descarga tu clave privada de Firebase Console -> Configuración -> Cuentas de Servicio.');
    console.error('👉 Renombra el archivo descargado a "creds.json" y ponlo en esta carpeta: ' + __dirname);
    console.error('👉 Luego vuelve a ejecutar este script.\n');
    process.exit(1);
}

const serviceAccount = require(credsPath);

// Inicializar Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function exportData() {
    console.log('\n🚀 Iniciando exportación de datos...');

    // 1. CARGAR USUARIOS DE FIREBASE AUTHENTICATION (Fuente de verdad para Nombre/Email)
    console.log('⏳ Descargando Usuarios de Authentication...');
    const allAuthUsers = [];
    let nextPageToken;
    do {
        const result = await admin.auth().listUsers(1000, nextPageToken);
        result.users.forEach(userRecord => {
            allAuthUsers.push({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                creationTime: userRecord.metadata.creationTime,
            });
        });
        nextPageToken = result.pageToken;
    } while (nextPageToken);
    console.log(`✅ ${allAuthUsers.length} Usuarios de Auth encontrados.`);

    // 2. CARGAR DATOS ADICIONALES DE FIRESTORE (Phone, Rol)
    console.log('⏳ Descargando Datos Adicionales de Firestore (Users)...');
    const usersSnapshot = await db.collection('Users').get();
    const mapFirestore = {};

    usersSnapshot.forEach(doc => {
        const d = doc.data();
        const uid = d.userId || null;
        if (uid) {
            mapFirestore[uid] = {
                phone: d.phone,
                rol: d.rol,
                name: d.name // Backup
            };
        }
    });

    // 3. CARGAR SUSCRIPCIONES
    console.log('⏳ Descargando Suscripciones...');
    const subsSnapshot = await db.collection('subscription').get();
    const mapSubs = {};

    subsSnapshot.forEach(doc => {
        const s = doc.data();
        // Indexar por userId (prioridad)
        if (s.userId) mapSubs[s.userId] = s;
        // O indexar por email como fallback
        if (s.email) mapSubs['email:' + s.email.trim().toLowerCase()] = s;
    });

    // 4. UNIFICAR TODO EN UN REPORTE
    console.log('🔄 Cruzando tablas (Auth + Firestore + Subscriptions)...');
    const finalReport = [];

    allAuthUsers.forEach(authUser => {
        const uid = authUser.uid;
        const fsData = mapFirestore[uid] || {};

        // Buscar suscripción
        let subData = mapSubs[uid];
        if (!subData && authUser.email) {
            subData = mapSubs['email:' + authUser.email.trim().toLowerCase()];
        }

        finalReport.push({
            // Datos Usuario
            Nombre: authUser.displayName || fsData.name || 'Sin Nombre',
            Email: authUser.email || 'Sin Email',
            Telefono: fsData.phone || 'Sin Teléfono',
            Rol: fsData.rol || 'user',
            Fecha_Registro: authUser.creationTime ? new Date(authUser.creationTime).toISOString().split('T')[0] : '',

            // Datos Suscripción
            Suscripcion_Activa: subData ? 'SI' : 'NO',
            Inicio_Suscripcion: subData ? (subData.startDate && subData.startDate.toDate ? subData.startDate.toDate().toISOString().split('T')[0] : '') : '',
            Fin_Suscripcion: subData ? (subData.endDate && subData.endDate.toDate ? subData.endDate.toDate().toISOString().split('T')[0] : '') : '',
            Plan: subData ? (subData.plan || 'Premium') : ''
        });
    });

    console.log(`✅ ${finalReport.length} Registros totales generados.`);

    // 5. GENERAR EXCEL
    console.log('💾 Guardando archivo Excel Sincronizado...');

    const wb = XLSX.utils.book_new();

    if (finalReport.length > 0) {
        const ws = XLSX.utils.json_to_sheet(finalReport);
        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 25 }, // Nombre
            { wch: 30 }, // Email
            { wch: 15 }, // Telefono
            { wch: 10 }, // Rol
            { wch: 15 }, // Registro
            { wch: 10 }, // Activa
            { wch: 15 }, // Inicio
            { wch: 15 }, // Fin
            { wch: 15 }  // Plan
        ];
        XLSX.utils.book_append_sheet(wb, ws, "Base de Datos Unificada");
    } else {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ info: "Sin datos" }]), "Datos");
    }

    const fileName = 'BaseDatos_Sincronizada.xlsx';
    XLSX.writeFile(wb, fileName);

    console.log(`\n🎉 ¡LISTO! Archivo generado: ${fileName}`);
    console.log(`📂 Ubicación: ${__dirname}/${fileName}\n`);
}

exportData().catch(console.error);
