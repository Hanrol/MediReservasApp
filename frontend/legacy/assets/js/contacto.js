import { validateContact } from "./validaciones.js";

const form = document.querySelector("#formularioContacto");
const successMessage = document.querySelector("#mensajeExito");

const errorElements = {
    nombre: document.querySelector("#errorNombre"),
    correo: document.querySelector("#errorCorreo"),
    asunto: document.querySelector("#errorAsunto"),
    mensaje: document.querySelector("#errorMensaje")
};

function clearFeedback() {
    Object.values(errorElements).forEach((element) => {
        element.textContent = "";
    });
    successMessage.classList.add("hidden");
    successMessage.querySelector("p").textContent = "";
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFeedback();

    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    const errors = validateContact(values);

    if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
            errorElements[field].textContent = message;
        });
        return;
    }

    successMessage.querySelector("p").textContent = "El mensaje fue enviado correctamente.";
    successMessage.classList.remove("hidden");
    form.reset();
});
