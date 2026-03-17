// =============================================
// Firebase Auth - Login, Logout e Proteção de Rotas
// =============================================

// ---- CONFIGURAÇÃO DE AUTORIZAÇÃO ----
// Placeholder para o domínio autorizado. Substitua pelo domínio real dos parceiros.
const AUTHORIZED_DOMAIN = "@gmail.com";

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

        // Limpa mensagem de erro anterior
        if (errorMsg) errorMsg.textContent = "";

        auth.signInWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                const user = userCredential.user;
                if (!isAuthorized(user.email)) {
                    // Usuário não autorizado → desloga e redireciona para aviso
                    auth.signOut().then(() => {
                        window.location.href = "../aviso/index.html";
                    });
                    return;
                }
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

// ---- CADASTRO (Solicitação de Cadastro) ----
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        // Limpa mensagem de erro anterior e define cor padrão (vermelho para erros)
        if (errorMsg) {
            errorMsg.textContent = "";
            errorMsg.style.color = "#ff6b6b";
        }

        // Verifica se o domínio é autorizado antes de prosseguir
        if (!isAuthorized(email)) {
            if (errorMsg) {
                errorMsg.textContent = "Domínio de e-mail não autorizado.";
            }
            return;
        }

        // Verifica se o e-mail já existe na coleção de solicitações
        db.collection("solicitacoes").where("email", "==", email).get()
            .then(function (querySnapshot) {
                if (!querySnapshot.empty) {
                    if (errorMsg) {
                        errorMsg.textContent = "Este e-mail já está em uso.";
                    }
                    return;
                }

                // Salva a solicitação no Firestore em vez de criar a conta diretamente.
                // Por segurança, NÃO armazenamos a senha. O administrador criará a conta
                // e o usuário poderá definir/redefinir sua senha após a aprovação.
                db.collection("solicitacoes").add({
                    email: email,
                    status: "pendente",
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                    .then(function () {
                        // Exibe mensagem de sucesso e altera a cor para verde
                        if (errorMsg) {
                            errorMsg.textContent = "Solicitação de cadastro enviada";
                            errorMsg.style.color = "#4BB543"; // Verde para sucesso
                        }
                        // Limpa os campos do formulário
                        registerForm.reset();
                    })
                    .catch(function (error) {
                        console.error("Erro ao enviar solicitação: ", error);
                        if (errorMsg) {
                            errorMsg.textContent = "Erro ao enviar solicitação. Tente novamente.";
                            errorMsg.style.color = "#ff6b6b";
                        }
                    });
            })
            .catch(function (error) {
                console.error("Erro ao verificar e-mail: ", error);
                if (errorMsg) {
                    errorMsg.textContent = "Erro ao processar solicitação. Tente novamente.";
                }
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
