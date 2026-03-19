const list = document.getElementById("userList");


// 🔒 PROTEÇÃO (só você acessa)
auth.onAuthStateChanged(user => {
    if (!user || user.email !== "henriqueteruya12@gmail.com") {
        window.location.href = "../login/index.html";
    }
});

// 🔄 CARREGAR USUÁRIOS PENDENTES
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

                <button onclick="approveUser('${doc.id}', '${data.email}', '${data.password}')">
                    Aprovar
                </button>

                <button onclick="rejectUser('${doc.id}')"
                    style="background-color: #a83232; margin-left: 10px;">
                    Rejeitar
                </button>
            `;

            list.appendChild(div);
        });
    });

// ✅ APROVAR USUÁRIO
function approveUser(id, email, password) {

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            return db.collection("pending_users").doc(id).update({
                status: "approved"
            });
        })
        .then(() => {
            alert("Usuário aprovado!");

            // 👇 remove da tela SEM reload
            const element = document.getElementById("user-" + id);
            if (element) element.remove();

        })
        .catch(err => {
            console.error(err);
        });
}

// ❌ REJEITAR USUÁRIO
function rejectUser(id) {

    db.collection("pending_users").doc(id).delete()
        .then(() => {
            alert("Solicitação rejeitada.");

            const element = document.getElementById("user-" + id);
            if (element) element.remove();
        })
        .catch(err => {
            console.error(err);
        });
}