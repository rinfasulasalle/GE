function validateForm() {
    const dateInput = document.getElementById('date');
    const formatSelect = document.getElementById('format');

    const dateFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/; 
    

    if (!dateInput.value) {
        alert('Por favor, ingrese una fecha.');
        return false;
    }

    const currentDate = new Date();

    const selectedDate = new Date(dateInput.value);


    if (selectedDate > currentDate) {
        alert('La fecha no puede ser posterior a la fecha actual.');
        return false;
    }

    if (!dateInput.value.match(dateFormat)) {
        alert('El formato de fecha debe ser dd/mm/aaaa.');
        return false;
    }

    // Validar que el formato de exportación esté seleccionado
    if (formatSelect.value === '') {
        alert('Por favor, seleccione un formato de exportación.');
        return false;
    }

    return true;
}

