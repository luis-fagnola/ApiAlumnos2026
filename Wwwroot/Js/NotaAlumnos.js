// Obtener desde la API la lista de notas con sus datos de alumno.
function obtenerNotaAlumnos() {
    fetch("/api/NotaAlumnoes/vista")
    .then ((response) => response.json())
    .then ((data) => MostrarNotaAlumnos(data))
    .catch ((error) => console.log('Error al obtener los alumnos:', error));
}

// Carga las asignaturas en el select del modal.
async function cargarAsignaturas() {
    try {
        const respuesta = await fetch("/api/Asignaturas");
        if (!respuesta.ok) throw new Error("Error al obtener asignaturas");

        const asignaturas = await respuesta.json();

        const selectAlta = document.getElementById("selectAsignaturas");
        selectAlta.innerHTML = "<option value='' disabled selected>Seleccionar asignatura</option>";

        const selectEditar = document.getElementById("editarAsignatura");
        selectEditar.innerHTML = "<option value='' disabled selected>Seleccionar asignatura</option>";

        asignaturas.forEach((asignatura) => {
            const optAlta = document.createElement("option");
            optAlta.value = asignatura.asignaturaID;
            optAlta.textContent = asignatura.descripcion;
            selectAlta.appendChild(optAlta);

            const optEditar = document.createElement("option");
            optEditar.value = asignatura.asignaturaID;
            optEditar.textContent = asignatura.descripcion;
            selectEditar.appendChild(optEditar);
        });
    } catch (error) {
        console.error("Error al cargar asignaturas:", error);
    }
}

// Carga los alumnos en el select del modal.
async function cargarAlumnos() {
    try {
        const respuesta = await fetch("/api/Alumnos");
        if (!respuesta.ok) throw new Error("Error al obtener alumnos");

        const alumnos = await respuesta.json();
        const selectAlumno = document.getElementById("selectAlumno");

        if (!selectAlumno) return;

        selectAlumno.innerHTML = "<option value='' disabled selected>Seleccionar alumno</option>";

        alumnos.forEach((alumno) => {
            const option = document.createElement("option");
            const alumnoId = alumno.alumnoID ?? alumno.alumnoId;
            const dni = alumno.dNI ?? alumno.dni ?? "-";

            option.value = alumnoId;
            option.textContent = `${alumno.apellido ?? ""}, ${alumno.nombre ?? ""} (${dni})`;
            selectAlumno.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar alumnos:", error);
    }
}

// Muestra la tabla principal de NotaAlumnos en pantalla.
   function MostrarNotaAlumnos(data) {
    $("#tablaAlumnos").empty();

    $.each(data, function (index, registro) {
    const id = registro.notaAlumnoID ?? registro.notaAlumnoId;

        $("#tablaAlumnos").append(
            `<tr>
        <td>${registro.nombre ?? ""}</td>
        <td>${registro.apellido ?? ""}</td>
        <td>${registro.dNI ?? registro.dni ?? "<span class='text-muted'>-</span>"}</td>
        <td>${registro.nota != null ? registro.nota : "<span class='text-muted'>Sin nota</span>"}</td>
        <td>${registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-AR') : "<span class='text-muted'>-</span>"}</td>
                 <td class="text-center">
                    ${id > 0 ? `<button class="btn btn-sm btn-warning me-2" onclick="MostrarModalEditar(${id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="EliminarAlumno(${id})">Eliminar</button>` : ""}
              
                 <button class="btn btn-sm btn-info" onclick="verHistorialAlumno(${id})">Historial</button>

                </td>
            </tr>`);
    });
}

// Valida el formulario 
function ValidarFormulario() {
    const selectAlumno = document.getElementById("selectAlumno");
    const selectAsignaturas = document.getElementById("selectAsignaturas");

  let inputNota = document.getElementById("Nota");
  let errorNota = document.getElementById("errorNotaAlumno");
  let nota = inputNota.value.trim();

  errorNota.textContent = "";
  inputNota.classList.remove("is-invalid", "is-valid");

  let esValido = true;

    // Valida que se seleccione alumno y asignatura.
    if (!selectAlumno || !selectAlumno.value) {
        alert("Debe seleccionar un alumno");
        esValido = false;
    }

    if (!selectAsignaturas || !selectAsignaturas.value) {
        alert("Debe seleccionar una asignatura");
        esValido = false;
    }

    // Valida que la nota exista y este entre 1 y 10.
    const notaNumero = Number(nota);

    if(!nota) {
        inputNota.classList.add("is-invalid");
        errorNota.textContent = "Campo obligatorio";
        esValido = false;
    } else if (!Number.isFinite(notaNumero) || notaNumero < 1 || notaNumero > 10) {
        inputNota.classList.add("is-invalid");
        errorNota.textContent = "La nota debe estar entre 1 y 10";
        esValido = false;
    } else {
        inputNota.classList.remove("is-invalid");
        errorNota.textContent = "";
    }

  return esValido;
}

// Valida el formulario de edicion antes de enviar cambios.
function ValidarFormularioEditar() {
    let nombre = document.getElementById("editarNombre").value.trim();
    let apellido = document.getElementById("editarApellido").value.trim();
    let dni = document.getElementById("editarDni").value.trim();
    let nota = document.getElementById("editarNota").value.trim();

    if (!nombre || !apellido || !dni || !nota) {
        alert("Todos los campos son obligatorios");
        return false;
    }

    const notaNumero = Number(nota);

    if (!Number.isFinite(notaNumero) || notaNumero < 1 || notaNumero > 10) {
        alert("La nota debe estar entre 1 y 10");
        return false;
    }

    if (dni.length < 8 || dni.length > 11 || !dni.match(/^\d+$/)) {
        alert("El DNI debe contener entre 8 y 11 digitos numericos");
        return false;
    }

    return true;
}


// se crea o edita un alumno segun exista o no un ID cargado.
function BuscarAlumnoId () {
    if (!ValidarFormulario()) {
        return;
    }
    let id = parseInt(document.getElementById("AlumnoId").value);
    if (!id || id == 0) {
        CrearAlumno();
    } else {
        EditarAlumno();
    }
}

// Crea primero el alumno y luego su nota en la asignatura.
    async function CrearAlumno() {
        const notaValor = Number(document.getElementById("Nota").value);
        const alumnoId = parseInt(document.getElementById("selectAlumno").value);
        const fecha = document.getElementById("Fecha")?.value;

        if (!Number.isFinite(notaValor) || notaValor < 1 || notaValor > 10) {
            document.getElementById("Nota").classList.add("is-invalid");
            document.getElementById("errorNotaAlumno").textContent = "La nota debe estar entre 1 y 10";
            return;
        }

        if (!alumnoId) {
            alert("Debe seleccionar un alumno");
            return;
        }

        const asignaturaId = parseInt(document.getElementById("selectAsignaturas").value);
        if (!asignaturaId) {
            alert("Debe seleccionar una asignatura");
            return;
        }

        try {
            // Alta de nota vinculada al alumno y asignatura seleccionada.
            const notaResponse = await fetch("/api/NotaAlumnoes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    alumnoID: alumnoId,
                    asignaturaID: asignaturaId,
                    nota: notaValor,
                    fecha: fecha ? new Date(fecha).toISOString() : undefined
                })
            });

            if (!notaResponse.ok) {
                const msg = await notaResponse.text();
                throw new Error(msg || "No se pudo crear la nota");
            }

            // Limpia formulario, cierra modal y refresca tabla.
            document.getElementById("selectAlumno").value = "";
            document.getElementById("Nota").value = "";
            if (document.getElementById("Fecha")) {
                document.getElementById("Fecha").value = "";
            }

            let modal= bootstrap.Modal.getInstance(document.getElementById("modalAlumnos"));
            modal.hide();
            obtenerNotaAlumnos();
        } catch (error) {
            console.log("Error al crear la nota:", error);
            alert("No se pudo guardar: " + error.message);
        }
    }


// Carga datos del registro y abre el modal de edicion.
function MostrarModalEditar(id, alumnoId, asignaturaId){
    fetch(`/api/NotaAlumnoes/${id}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
    })
    .then((response) => response.json())
    .then((data) => {
        const alumno = data.alumno || {};
        const hiddenId = document.getElementById("editarId");
        
        hiddenId.value = data.notaAlumnoID ?? data.notaAlumnoId ?? id;
        hiddenId.dataset.alumnoId = alumnoId ?? data.alumnoID ?? data.alumnoId ?? alumno.alumnoID ?? alumno.alumnoId;
        hiddenId.dataset.asignaturaId = asignaturaId ?? data.asignaturaID ?? data.asignaturaId;

        document.getElementById("editarNombre").value = alumno.nombre ?? "";
        document.getElementById("editarApellido").value = alumno.apellido ?? "";
        document.getElementById("editarDni").value = alumno.dNI ?? alumno.dni ?? "";
        document.getElementById("editarNota").value = data.nota;
        document.getElementById("editarFecha").value = data.fecha ? new Date(data.fecha).toISOString().split('T')[0] : "";

        const asignaturaActual = asignaturaId ?? data.asignaturaID ?? data.asignaturaId;
        document.getElementById("editarAsignatura").value = asignaturaActual;

        let modal = new bootstrap.Modal(document.getElementById("editarAlumnoModal"));
        modal.show();
    })
    .catch((error) => console.log("Error al obtener el alumno:", error));
}


//funcion para mostrar el historial de cambios de una nota de alumno
function verHistorialAlumno(id) {
    if (!id || id === 0) {
        alert("Este alumno no tiene una nota registrada, por lo que no hay historial disponible.");
        return;
    }
    fetch(`/api/NotaAlumnoes/${id}/historial`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then((response) => {
        if (response.status === 404) {
            return [];
        }
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {

        const historialList = document.getElementById("tablaHistorial");
        historialList.innerHTML = "";

        if (!data || data.length === 0) {
            historialList.innerHTML =
                "<tr><td colspan='4' class='text-center text-muted'>No hay cambios registrados para esta nota.</td></tr>";
        } else {
            data.forEach((cambio) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${cambio.campoModificado ?? "-"}</td>
                    <td>${cambio.valorAnterior ?? "-"}</td>
                    <td>${cambio.valorNuevo ?? "-"}</td>
                    <td>${cambio.fechaCambio ? new Date(cambio.fechaCambio).toLocaleString('es-AR') : "-"}</td>`;
                historialList.appendChild(row);
            });
        }

        let modal = new bootstrap.Modal(
            document.getElementById("historialAlumnoModal")
        );
        modal.show();
    })
    .catch((error) => {
        console.error("Error al obtener el historial:", error);
        alert("No se pudo cargar el historial. Intente nuevamente.");
    });
}



// Actualiza alumno y nota en la API usando los IDs guardados en el modal.
async function EditarAlumno() {
    if (!ValidarFormularioEditar()) {
        return;
    }

    let id= parseInt(document.getElementById("editarId").value);
    const hiddenId = document.getElementById("editarId");
    const alumnoId = Number(hiddenId.dataset.alumnoId);
    const asignaturaId = parseInt(document.getElementById("editarAsignatura").value);
    const notaValor = Number(document.getElementById("editarNota").value);
    

    let alumno = {
        alumnoID: alumnoId,
        nombre: document.getElementById("editarNombre").value,
        apellido: document.getElementById("editarApellido").value,
        dni: document.getElementById("editarDni").value,
        sexo: 3,
        domicilio: "Sin domicilio"
        
    };

    const fechaEditar = document.getElementById("editarFecha").value;

    let notaAlumno = {
        notaAlumnoID: id,
        alumnoID: alumnoId,
        asignaturaID: asignaturaId,
        nota: notaValor,
        fecha: fechaEditar ? new Date(fechaEditar).toISOString() : new Date().toISOString()
    };



    try {
        // Actualiza datos del alumno.
        const alumnoResponse = await fetch(`/api/Alumnos/${alumnoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(alumno)
        });

        if (!alumnoResponse.ok) {
            const msg = await alumnoResponse.text();
            throw new Error(msg || "No se pudo editar el alumno");
        }
console.log(notaAlumno);
        // Actualiza la nota.
        const notaResponse = await fetch(`/api/NotaAlumnoes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(notaAlumno)
        });

        if (!notaResponse.ok) {
            const msg = await notaResponse.text();
            throw new Error(msg || "No se pudo editar la nota");
        }

        //Limpia campos, cierra modal y refresca la grilla.
        document.getElementById("editarId").value = "";
        document.getElementById("editarNombre").value = "";
        document.getElementById("editarApellido").value = "";
        document.getElementById("editarDni").value = "";
        document.getElementById("editarNota").value = "";
        document.getElementById("editarFecha").value = "";
        let modal = bootstrap.Modal.getInstance(document.getElementById("editarAlumnoModal"));
        modal.hide();
        obtenerNotaAlumnos();
    } catch (error) {
        console.log("Error al editar el alumno:", error);
        alert("No se pudo editar: " + error.message);
    }
}


//confirmacion antes de eliminar.
function EliminarAlumno (id) {
    var Eliminar = confirm("¿Está seguro de eliminar el alumno?");
    if (Eliminar==true) {
        EliminarSi(id);
    }
}


// Elimina la nota del alumno y vuelve a cargar la tabla.
function EliminarSi(id) {
    fetch(`/api/NotaAlumnoes/${id}`, {
        method: "DELETE",
        
    })
    .then (() => {
        obtenerNotaAlumnos();
    })
    .catch((error) => console.log("Error al eliminar el alumno:", error));
}


obtenerNotaAlumnos();
cargarAsignaturas();
cargarAlumnos();