// =============================================
// Firebase Auth - Login, Logout e Proteção de Rotas
// =============================================

// ---- CONFIGURAÇÃO DE AUTORIZAÇÃO ----
// Placeholder para o domínio autorizado. Substitua pelo domínio real dos parceiros.
const AUTHORIZED_DOMAIN = "@gmail.com";

const ADMIN_EMAIL = "henriqueteruya12@gmail.com";
/**
 * Verifica se o usuário está autorizado com base no e-mail.
 */
function isAuthorized(email) {
    return email && email.endsWith(AUTHORIZED_DOMAIN);
}

// ---- LOGIN ----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        // Avisa que o usuário não está autorizado
        if (errorMsg) errorMsg.textContent = "";

        auth.signInWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                const user = userCredential.user;

                if (!isAuthorized(user.email)) {
                    auth.signOut().then(() => {
                        window.location.href = "../aviso/index.html";
                    });
                    return;
                }

                // 👇 NOVA LÓGICA
                if (user.email === ADMIN_EMAIL) {
                    window.location.href = "../admin/index.html";
                } else {
                    window.location.href = "../dashboard/index.html";
                }
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
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        if (errorMsg) errorMsg.textContent = "";

        try {
            // NÃO cria usuário no Auth
            // Apenas salva no Firestore

            await db.collection("pending_users").add({
                email: email,
                password: password,
                status: "pending",
                createdAt: new Date()
            });

            // Mensagem de sucesso
            if (errorMsg) {
                errorMsg.style.color = "green";
                errorMsg.textContent = "Solicitação de cadastro enviada";
            }

        } catch (error) {
            console.error(error);

            if (errorMsg) {
                errorMsg.style.color = "red";
                errorMsg.textContent = "Erro ao enviar solicitação.";
            }
        }
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
    const isAvisoPage = window.location.pathname.includes("/aviso");
    currentUser = user;

    if (user) {
        // Verifica se o usuário logado está autorizado
        if (!isAuthorized(user.email)) {
            // Se não estiver autorizado e não estiver na página de aviso, desloga e redireciona
            if (!isAvisoPage) {
                auth.signOut().then(() => {
                    window.location.href = "../aviso/index.html";
                });
                return;
            }
        }

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
