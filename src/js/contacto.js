function sendMessage() {
    // Obtengo los valores
    const origen = document.getElementById("origen").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const consulta = document.getElementById("consulta").value;

    // Tu número de WhatsApp en formato internacional
    const phone = "543515957014";

    // Armo el mensaje
    let message = `Hola, soy ${fullName}.%0A`;
    message += `Llegué a tu web por ${origen}.%0A`;
    if (email) {
        message += `Mi email es ${email}.%0A`;
    }
    if (consulta) {
        message += `Quería consultar ${consulta}.%0A`;
    }

    // URL de WhatsApp
    const url = `https://wa.me/${phone}?text=${message}`;

    // Abrir en nueva pestaña
    window.open(url, "_blank");

    return false; // Evita que el formulario se envíe de forma tradicional
}