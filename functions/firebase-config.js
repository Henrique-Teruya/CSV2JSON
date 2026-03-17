// =============================================
// Firebase Configuration - CSV2JSON
// =============================================
// IMPORTANTE: Substitua os valores abaixo pelas
// credenciais do seu projeto Firebase.
// Firebase Console → Configurações do projeto → Geral → Seus apps
// =============================================

const firebaseConfig = {
    apiKey: "AIzaSyAMmubQRCaCBmduc9GL_vXIjXLUHvdG7_A",
    authDomain: "csv2json-apepe.firebaseapp.com",
    projectId: "csv2json-apepe",
    storageBucket: "csv2json-apepe.firebasestorage.app",
    messagingSenderId: "1090946063428",
    appId: "1:1090946063428:web:2328fdaaf3087d09fbf011"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Exporta a instância de autenticação para uso global
const auth = firebase.auth();

const db = firebase.firestore();
