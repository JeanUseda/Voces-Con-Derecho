const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");


/* Mostrar / ocultar contraseña */

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.textContent =
        isPassword ? "Ocultar" : "Mostrar";

});


/* Login */

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const usuario =
        document.getElementById("usuario").value.trim();

    const password =
        passwordInput.value.trim();


    if (!usuario || !password) {

        loginMessage.textContent =
            "Completa todos los campos.";

        loginMessage.style.color = "#d9366f";

        return;
    }


    /*
        Por ahora no conectamos con autenticación.

        La autenticación real se conectará
        posteriormente con el backend ASP.NET.
    */

    loginMessage.textContent =
        "Formulario listo para conectar con el servidor.";

    loginMessage.style.color = "#5636c9";

});