document.addEventListener("DOMContentLoaded", obtenerAlumnos);

// Obtiene la lista de alumnos desde la vista de la API.
function obtenerAlumnos() {
    fetch("/api/Alumnos/vista")
        .then((response) => response.json())
        .then((data) => MostrarAlumnos(data))
        .catch((error) => console.log("Error al obtener los alumnos:", error));
}

// muestra la tabla con los datos de VistaAlumno.
function MostrarAlumnos(data) {
    $("#tablaAlumnos").empty();

    $.each(data, function (index, registro) {
        const id = registro.alumnoID;

        $("#tablaAlumnos").append(
            `<tr>
                
                <td>${registro.nombre ?? ""}</td>
                <td>${registro.apellido ?? ""}</td>
                <td>${registro.dNI ?? registro.dni ?? ""}</td>
                <td>${registro.domicilio ?? ""}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning me-2" onclick="MostrarModalEditar(${id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="EliminarAlumno(${id})">
                        Eliminar
                    </button>
                </td>
            </tr>`
        );
    });
}

// Valida el formulario de alta.
function ValidarFormulario() {
    let inputNombre = document.getElementById("Nombre");
    let errorNombre = document.getElementById("errorNombreAlumno");
    let nombre = inputNombre.value.trim();

    let inputApellido = document.getElementById("Apellido");
    let errorApellido = document.getElementById("errorApellidoAlumno");
    let apellido = inputApellido.value.trim();

    let inputDni = document.getElementById("Dni");
    let errorDni = document.getElementById("errorDniAlumno");
    let dni = inputDni.value.trim();

    let inputDomicilio = document.getElementById("Domicilio");
    let errorDomicilio = document.getElementById("errorDomicilioAlumno");
    let domicilio = inputDomicilio.value.trim();

    let inputSexo = document.getElementById("Sexo");
    let errorSexo = document.getElementById("errorSexoAlumno");
    let sexo = inputSexo.value;

    errorNombre.textContent = "";
    inputNombre.classList.remove("is-invalid", "is-valid");
    errorApellido.textContent = "";
    inputApellido.classList.remove("is-invalid", "is-valid");
    errorDni.textContent = "";
    inputDni.classList.remove("is-invalid", "is-valid");
    errorDomicilio.textContent = "";
    inputDomicilio.classList.remove("is-invalid", "is-valid");
    errorSexo.textContent = "";
    inputSexo.classList.remove("is-invalid", "is-valid");

    let esValido = true;

    if (!nombre) {
        inputNombre.classList.add("is-invalid");
        errorNombre.textContent = "Campo obligatorio";
        esValido = false;
    }

    if (!apellido) {
        inputApellido.classList.add("is-invalid");
        errorApellido.textContent = "Campo obligatorio";
        esValido = false;
    }

    if (!dni) {
        inputDni.classList.add("is-invalid");
        errorDni.textContent = "Campo obligatorio";
        esValido = false;
    } else if (dni.length < 8 || dni.length > 11) {
        inputDni.classList.add("is-invalid");
        errorDni.textContent = "Debe contener entre 8 y 11 dígitos numéricos";
        esValido = false;
    } else if (!dni.match(/^\d+$/)) {
        inputDni.classList.add("is-invalid");
        errorDni.textContent = "Debe contener solo dígitos numéricos";
        esValido = false;
    }

    if (!domicilio) {
        inputDomicilio.classList.add("is-invalid");
        errorDomicilio.textContent = "Campo obligatorio";
        esValido = false;
    }

    if (!sexo) {
        inputSexo.classList.add("is-invalid");
        errorSexo.textContent = "Campo obligatorio";
        esValido = false;
    }

    return esValido;
}

// Determina si se crea o edita según el ID cargado.
function BuscarAlumnoId() {
    if (!ValidarFormulario()) return;

    let id = parseInt(document.getElementById("AlumnoId").value);
    if (!id || id === 0) {
        CrearAlumno();
    } else {
        EditarAlumno();
    }
}

// Crea un alumno y luego su nota.
async function CrearAlumno() {
    let alumno = {
        nombre: document.getElementById("Nombre").value,
        apellido: document.getElementById("Apellido").value,
        dni: document.getElementById("Dni").value,
        sexo: Number(document.getElementById("Sexo").value),
        domicilio: document.getElementById("Domicilio").value
    };

    try {
        const alumnoResponse = await fetch("/api/Alumnos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumno)
        });

        if (!alumnoResponse.ok) {
            const msg = await alumnoResponse.text();
            throw new Error(msg || "No se pudo crear el alumno");
        }

        document.getElementById("Nombre").value = "";
        document.getElementById("Apellido").value = "";
        document.getElementById("Dni").value = "";
        document.getElementById("Domicilio").value = "";
        document.getElementById("Sexo").value = "";

        bootstrap.Modal.getInstance(document.getElementById("modalAlumnos")).hide();
        obtenerAlumnos();
    } catch (error) {
        console.log("Error al crear el alumno:", error);
        alert("No se pudo guardar: " + error.message);
    }
}

// Carga datos del alumno en el modal de edición.
function MostrarModalEditar(id) {
    fetch(`/api/Alumnos/${id}`)
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("editarId").value = data.alumnoID ?? data.alumnoId ?? id;
            document.getElementById("editarNombre").value = data.nombre ?? "";
            document.getElementById("editarApellido").value = data.apellido ?? "";
            document.getElementById("editarDni").value = data.dNI ?? data.dni ?? "";
            document.getElementById("editarSexo").value = String(data.sexo ?? 3);
            document.getElementById("editarDomicilio").value = data.domicilio ?? "";

            new bootstrap.Modal(document.getElementById("editarAlumnoModal")).show();
        })
        .catch((error) => console.log("Error al obtener el alumno:", error));
}

// Actualiza los datos del alumno.
async function EditarAlumno() {
    let id = parseInt(document.getElementById("editarId").value);
    let nombre = document.getElementById("editarNombre").value.trim();
    let apellido = document.getElementById("editarApellido").value.trim();
    let dni = document.getElementById("editarDni").value.trim();
    let sexo = document.getElementById("editarSexo").value;

    let domicilio = document.getElementById("editarDomicilio").value.trim();

    if (!nombre || !apellido || !dni || !domicilio || !sexo) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let alumno = {
        alumnoID: id,
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        sexo: Number(sexo),
        domicilio: domicilio
    };

    try {
        const response = await fetch(`/api/Alumnos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumno)
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "No se pudo editar el alumno");
        }

        bootstrap.Modal.getInstance(document.getElementById("editarAlumnoModal")).hide();
        obtenerAlumnos();
    } catch (error) {
        console.log("Error al editar el alumno:", error);
        alert("No se pudo guardar: " + error.message);
    }
}

// Elimina un alumno por ID.
function EliminarAlumno(id) {
    if (!confirm("¿Está seguro que desea eliminar este alumno?")) return;

    fetch(`/api/Alumnos/${id}`, { method: "DELETE" })
        .then((response) => {
            if (!response.ok) throw new Error("No se pudo eliminar el alumno");
            obtenerAlumnos();
        })
        .catch((error) => {
            console.log("Error al eliminar el alumno:", error);
            alert("No se pudo eliminar: " + error.message);
        });
}
