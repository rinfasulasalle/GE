const dniInput = document.getElementById("dni");
const correoInput = document.getElementById("correo");

document.addEventListener("DOMContentLoaded", function() {

    dniInput.addEventListener("input", function() {

        const cleanedValue = dniInput.value.replace(/\D/g, '');


        const truncatedValue = cleanedValue.slice(0, 8);


        dniInput.value = truncatedValue;
    });

    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        const dniValue = dniInput.value;


        if (dniValue.length < 8) {
            event.preventDefault();
            alert("El DNI debe tener 8 dígitos.");
        }
    });
});

