// Pide la lista de docentes , llama a mostrarDocentes .
function obtenerDocentes() {
    fetch("/api/Docentes")
        .then((response) => response.json())
        .then((data) => mostrarDocentes(data))
        .catch((error) => console.log("Error al obtener los docentes:", error));
}

// Convierte el valor numerico del sexo.

function sexoElegido(sexo) {
    const valor = Number(sexo);
    if (valor === 1) return "Masculino";
    if (valor === 2) return "Femenino";
    if (valor === 3) return "Otro";
    return "Sin definir";
}

// Arma la tabla de docentes con todos los datos
function mostrarDocentes(data) {
    $("#tablaDocentes").empty();

    $.each(data, function (index, registro) {
        const id = registro.docenteID ?? registro.docenteId;

        $("#tablaDocentes").append(
            `<tr>
                <td>${id}</td>
                <td>${registro.nombre ?? ""}</td>
                <td>${registro.apellido ?? ""}</td>
                <td>${registro.dni ?? registro.dNI ?? ""}</td>
                <td>${sexoElegido(registro.sexo)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning me-2" onclick="mostrarModalEditar(${id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarDocente(${id})">Eliminar</button>
                </td>
            </tr>`
        );
    });
}

// Valida todos los campos del formulario 
// Si baseId es vacio valida el formulario de alta, si es 'editar' valida el de edicion.
function validarFormulario(baseId = "") {
    const nombreInput = document.getElementById(baseId + "Nombre");
    const apellidoInput = document.getElementById(baseId + "Apellido");
    const dniInput = document.getElementById(baseId + "Dni");
    const sexoInput = document.getElementById(baseId + "Sexo");

    const nombre = (nombreInput?.value || "").trim();
    const apellido = (apellidoInput?.value || "").trim();
    const dni = (dniInput?.value || "").trim();
    const sexo = sexoInput?.value || "";

    if (baseId === "") {
        const errorNombre = document.getElementById("errorNombreDocente");
        const errorApellido = document.getElementById("errorApellidoDocente");
        const errorDni = document.getElementById("errorDniDocente");
        const errorSexo = document.getElementById("errorSexoDocente");

        errorNombre.textContent = "";
        errorApellido.textContent = "";
        errorDni.textContent = "";
        errorSexo.textContent = "";

        nombreInput.classList.remove("is-invalid");
        apellidoInput.classList.remove("is-invalid");
        dniInput.classList.remove("is-invalid");
        sexoInput.classList.remove("is-invalid");
    }

    let valido = true;

    if (!nombre) {
        valido = false;
        if (baseId === "") {
            document.getElementById("errorNombreDocente").textContent = "Campo obligatorio";
            nombreInput.classList.add("is-invalid");
        }
    }

    if (!apellido) {
        valido = false;
        if (baseId === "") {
            document.getElementById("errorApellidoDocente").textContent = "Campo obligatorio";
            apellidoInput.classList.add("is-invalid");
        }
    }

    if (!dni) {
        valido = false;
        if (baseId === "") {
            document.getElementById("errorDniDocente").textContent = "Campo obligatorio";
            dniInput.classList.add("is-invalid");
        }
    } else if (!/^\d{7,11}$/.test(dni)) {
        valido = false;
        if (baseId === "") {
            document.getElementById("errorDniDocente").textContent = "Debe contener entre 7 y 11 digitos numericos";
            dniInput.classList.add("is-invalid");
        }
    }

    if (!sexo) {
        valido = false;
        if (baseId === "") {
            document.getElementById("errorSexoDocente").textContent = "Seleccione una opcion";
            sexoInput.classList.add("is-invalid");
        }
    }

    if (baseId !== "" && !valido) {
        alert("Complete todos los campos correctamente");
    }

    return valido;
}

// Limpia todos los campos del formulario de alta de docente.
function limpiarFormularioNuevoDocente() {
    document.getElementById("DocenteId").value = "";
    document.getElementById("Nombre").value = "";
    document.getElementById("Apellido").value = "";
    document.getElementById("Dni").value = "";
    document.getElementById("Sexo").value = "";
}

// Decide si crear o editar  si hay un ID cargado en el campo.
function guardarDocente() {
    if (!validarFormulario("")) {
        return;
    }

    const id = Number(document.getElementById("DocenteId").value || 0);
    if (!id) {
        crearDocente();
        return;
    }

    editarDocente();
}

// guardarDocente para el onclick del boton del HTML.
function GuardarDocente() {
    guardarDocente();
}

// crear un nuevo docente.
// cierra el modal limpia el form y recarga la tabla.
async function crearDocente() {
    const payload = {
        nombre: document.getElementById("Nombre").value.trim(),
        apellido: document.getElementById("Apellido").value.trim(),
        dni: document.getElementById("Dni").value.trim(),
        sexo: Number(document.getElementById("Sexo").value)
    };

    try {
        const response = await fetch("/api/Docentes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "No se pudo crear el docente");
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById("modalDocentes"));
        if (modal) modal.hide();
        limpiarFormularioNuevoDocente();
        obtenerDocentes();
    } catch (error) {
        console.log("Error al crear docente:", error);
        alert("No se pudo guardar: " + error.message);
    }
}

// Pide los datos del docente  por ID y los carga en el modal de edicion.
function mostrarModalEditar(id) {
    fetch(`/api/Docentes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("editarId").value = data.docenteID ?? data.docenteId;
            document.getElementById("editarNombre").value = data.nombre ?? "";
            document.getElementById("editarApellido").value = data.apellido ?? "";
            document.getElementById("editarDni").value = data.dni ?? data.dNI ?? "";
            document.getElementById("editarSexo").value = Number(data.sexo);

            const modal = new bootstrap.Modal(document.getElementById("editarDocenteModal"));
            modal.show();
        })
        .catch((error) => console.log("Error al obtener docente:", error));
}

// mostrarModalEditar.
function mostrarModalEditarAlias(id) {
    mostrarModalEditar(id);
}

// actualizar el docente.
// cierra el modal y recarga la tabla.
async function editarDocente() {
    if (!validarFormulario("editar")) {
        return;
    }

    const id = Number(document.getElementById("editarId").value || 0);
    const payload = {
        docenteID: id,
        nombre: document.getElementById("editarNombre").value.trim(),
        apellido: document.getElementById("editarApellido").value.trim(),
        dni: document.getElementById("editarDni").value.trim(),
        sexo: Number(document.getElementById("editarSexo").value)
    };

    try {
        const response = await fetch(`/api/Docentes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "No se pudo editar el docente");
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById("editarDocenteModal"));
        if (modal) modal.hide();
        obtenerDocentes();
    } catch (error) {
        console.log("Error al editar docente:", error);
        alert("No se pudo editar: " + error.message);
    }
}

// editarDocente para el onclick del boton del HTML.
function EditarDocente() {
    editarDocente();
}

// Pide confirmacion antes de eliminar
function eliminarDocente(id) {
    if (!confirm("¿Está seguro de eliminar el docente?")) {
        return;
    }

    fetch(`/api/Docentes/${id}`, { method: "DELETE" })
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo eliminar el docente");
            }
            obtenerDocentes();
        })
        .catch((error) => {
            console.log("Error al eliminar docente:", error);
            alert(error.message);
        });
}

// carga la lista de docentes 
obtenerDocentes();
