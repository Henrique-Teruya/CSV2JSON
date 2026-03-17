// =============================================
// Firebase Auth - Login, Logout e Proteção de Rotas
// =============================================

// ---- LOGIN ----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        // Limpa mensagem de erro anterior
        if (errorMsg) errorMsg.textContent = "";

        auth.signInWithEmailAndPassword(email, password)
            .then(function () {
                // Login bem-sucedido → redireciona para o dashboard
                window.location.href = "../dashboard/index.html";
            })
            .catch(function (error) {
                // Exibe mensagem de erro amigável
                let message = "Erro ao fazer login.";
                switch (error.code) {
                    case "auth/user-not-found":
                        message = "Usuário não encontrado.";
                        break;
                    case "auth/wrong-password":
                        message = "Senha incorreta.";
                        break;
                    case "auth/invalid-email":
                        message = "E-mail inválido.";
                        break;
                    case "auth/invalid-credential":
                        message = "Credenciais inválidas. Verifique e-mail e senha.";
                        break;
                    case "auth/too-many-requests":
                        message = "Muitas tentativas. Tente novamente mais tarde.";
                        break;
                }
                if (errorMsg) errorMsg.textContent = message;
            });
    });
}

// ---- CADASTRO ----
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        // Limpa mensagem de erro anterior
        if (errorMsg) errorMsg.textContent = "";

        auth.createUserWithEmailAndPassword(email, password)
            .then(function () {
                // Cadastro bem-sucedido → redireciona para o dashboard
                window.location.href = "../dashboard/index.html";
            })
            .catch(function (error) {
                // Exibe mensagem de erro amigável
                let message = "Erro ao realizar cadastro.";
                switch (error.code) {
                    case "auth/email-already-in-use":
                        message = "Este e-mail já está em uso.";
                        break;
                    case "auth/invalid-email":
                        message = "E-mail inválido.";
                        break;
                    case "auth/operation-not-allowed":
                        message = "Operação não permitida.";
                        break;
                    case "auth/weak-password":
                        message = "A senha é muito fraca.";
                        break;
                }
                if (errorMsg) errorMsg.textContent = message;
            });
    });
}

// ---- LOGOUT ----
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(function () {
            window.location.href = "../login/index.html";
        });
    });
}

// ---- PROTEÇÃO DE ROTA (Dashboard) ----
// Verifica se estamos no dashboard e protege a página
const isDashboard = window.location.pathname.includes("/dashboard");
let currentUser = null;

const convertCSVLink = document.getElementById("convertCSVLink");
if (convertCSVLink) {
    convertCSVLink.addEventListener("click", function (event) {
        if (!currentUser) {
            event.preventDefault();
            const errorMsg = document.getElementById("errorMsg");
            const message = "Você precisa estar logado para acessar o conversor de CSV.";
            if (errorMsg) {
                errorMsg.textContent = message;
            } else {
                alert(message);
            }
        }
    });
}
auth.onAuthStateChanged(function (user) {
    const loginLink = document.getElementById("authLink");
    currentUser = user;

    if (user) {
        // Usuário logado
        if (loginLink) {
            loginLink.textContent = "Logout";
            loginLink.href = "#";
            loginLink.id = "authLink";
            loginLink.addEventListener("click", function (e) {
                e.preventDefault();
                auth.signOut().then(function () {
                    window.location.href = "../login/index.html";
                });
            });
        }
    } else {
        // Usuário NÃO logado
        if (isDashboard) {
            // Redireciona para login se tentar acessar dashboard sem autenticação
            window.location.href = "../login/index.html";
        }
        if (loginLink) {
            loginLink.textContent = "Login";
            loginLink.href = "../login/index.html";
        }
    }
});
