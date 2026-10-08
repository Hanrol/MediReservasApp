import { logout } from "./auth.js";

const logoutButton = document.querySelector("#logout-button");

logoutButton?.addEventListener("click", () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Cerrando sesión...";
    logout();
    window.location.replace("login.html");
});
