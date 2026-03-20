const list = document.getElementById("userList");

auth.onAuthStateChanged(user => {
    if (!user || user.email !== "henriqueteruya12@gmail.com") {
        window.location.href = "../login/index.html";
    }
});

// Inicializamos um app secundário do Firebase. O intuito é criar novos usuários
// SEM desconectar o administrador atual. O Firebase por padrão muda o usuário logado
// ao criar uma nova conta caso estejamos no app principal.
const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp");

// CARREGAR USUÁRIOS PENDENTES
db.collection("pending_users")
    .where("status", "==", "pending")
    .get()
    .then(snapshot => {

        if (snapshot.empty) {
            list.innerHTML = "<p>Nenhuma solicitação pendente.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();

            const div = document.createElement("div");
            div.id = "user-" + doc.id;

            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.marginBottom = "10px";
            div.style.borderRadius = "8px";

            div.innerHTML = `
                <p><strong>Email:</strong> ${data.email}</p>

                <button onclick="approveUser('${doc.id}', '${data.email}', '${data.password}')" class="button" style="margin: 2vh;">
                    Aprovar
                </button>

                <button onclick="rejectUser('${doc.id}')" class="button" style="background-color: #a83232;">
                    Rejeitar
                </button>
            `;

            list.appendChild(div);
        });
    });

// APROVAR USUÁRIO
function approveUser(id, email, password) {

    // Atualizamos o status no Firestore primeiro para garantir que a remoção visual aconteça
    db.collection("pending_users").doc(id).update({ status: "approved" })
        .then(() => {
            const element = document.getElementById("user-" + id);
            if (element) element.remove();

            // Usamos o secondaryApp para criar o usuário e evitar alterar o auth logado na sessão principal (admin)
            return secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        })
        .then(() => {
            // Deslogamos o usuário recém criado do app secundário por segurança
            return secondaryApp.auth().signOut();
        })
        .catch(err => {
            console.error(err);
        });
}

// REJEITAR USUÁRIO
function rejectUser(id) {

    db.collection("pending_users").doc(id).delete()
        .then(() => {
            // Remove da tela SEM reload e SEM alert
            const element = document.getElementById("user-" + id);
            if (element) element.remove();
        })
        .catch(err => {
            console.error(err);
        });
}