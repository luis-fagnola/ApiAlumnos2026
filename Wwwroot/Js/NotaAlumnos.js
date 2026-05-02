// Pide la lista de notas con datos de alumno 
function obtenerNotaAlumnos() {
    fetch("/api/NotaAlumnoes/vista")
    .then ((response) => response.json())
    .then ((data) => MostrarNotaAlumnos(data))
    .catch ((error) => console.log('Error al obtener los alumnos:', error));
}

// Carga la lista de alumnos
// Cada opcion muestra apellido, nombre y DNI del alumno.
async function cargarAlumnos() {
    try {
        const respuesta = await fetch("/api/Alumnos");
        if (!respuesta.ok) throw new Error("Error al obtener alumnos");

        const alumnos = await respuesta.json();

        const selectAlumno = document.getElementById("selectAlumno");
        selectAlumno.innerHTML = "<option value='' disabled selected>Seleccionar alumno</option>";

        alumnos.forEach((alumno) => {
            const opt = document.createElement("option");
            opt.value = alumno.alumnoID ?? alumno.alumnoId;
            opt.textContent = `${alumno.apellido}, ${alumno.nombre} - DNI: ${alumno.dNI ?? alumno.dni}`;
            selectAlumno.appendChild(opt);
        });
    } catch (error) {
        console.error("Error al cargar alumnos:", error);
    }
}

// Carga la lista de asignaturas  en el select de alta y edicion.
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

// Arma la tabla de notas  Muestra nombre, apellido, DNI, nota y fecha.
// Si el registro tiene ID valido, muestra los botones 
   function MostrarNotaAlumnos(data) {
    $("#tablaAlumnos").empty();

    $.each(data, function (index, registro) {
    const id = registro.notaAlumnoID ?? registro.notaAlumnoId;

        $("#tablaAlumnos").append(
            `<tr>
        <td>${registro.nombre ?? ""}</td>
        <td>${registro.apellido ?? ""}</td>
        <td>${registro.dNI ?? registro.dni ?? ""}</td>
        <td>${registro.nota != null ? registro.nota : "<span class='text-muted'>Sin nota</span>"}</td>
        <td>${registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-AR') : "<span class='text-muted'>-</span>"}</td>
                 <td class="text-center">
                    ${id > 0 ? `<button class="btn btn-sm btn-warning me-2" onclick="MostrarModalEditar(${id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="EliminarAlumno(${id})">Eliminar</button>` : ""}
                </td>
            </tr>`);
    });
}

// Valida el formulario de alta: alumno seleccionado, asignatura seleccionada

function ValidarFormulario() {
    let esValido = true;

    const selectAlumno = document.getElementById("selectAlumno");
    const errorAlumno = document.getElementById("errorSelectAlumno");
    selectAlumno.classList.remove("is-invalid");
    errorAlumno.textContent = "";
    if (!selectAlumno.value) {
        selectAlumno.classList.add("is-invalid");
        errorAlumno.textContent = "Debe seleccionar un alumno";
        esValido = false;
    }

    const selectAsignatura = document.getElementById("selectAsignaturas");
    const errorAsignatura = document.getElementById("errorSelectAsignatura");
    selectAsignatura.classList.remove("is-invalid");
    errorAsignatura.textContent = "";
    if (!selectAsignatura.value) {
        selectAsignatura.classList.add("is-invalid");
        errorAsignatura.textContent = "Debe seleccionar una asignatura";
        esValido = false;
    }

    const inputNota = document.getElementById("Nota");
    const errorNota = document.getElementById("errorNotaAlumno");
    const nota = inputNota.value.trim();
    inputNota.classList.remove("is-invalid");
    errorNota.textContent = "";
    const notaNumero = Number(nota);
    if (!nota) {
        inputNota.classList.add("is-invalid");
        errorNota.textContent = "Campo obligatorio";
        esValido = false;
    } else if (!Number.isFinite(notaNumero) || notaNumero < 1 || notaNumero > 10) {
        inputNota.classList.add("is-invalid");
        errorNota.textContent = "La nota debe estar entre 1 y 10";
        esValido = false;
    }

    return esValido;
}

// Valida el formulario de edicion todos los campos obligatorios,
// nota entre 1 y 10 y DNI con formato correcto.
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


// Decide si crear o editar si hay un ID cargado
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

// Envia la nueva nota del alumno y asignatura seleccionado.
// Limpia el formulario cierra el modal y recarga la tabla 
async function CrearAlumno() {
    const alumnoId = parseInt(document.getElementById("selectAlumno").value);
    const asignaturaId = parseInt(document.getElementById("selectAsignaturas").value);
    const notaValor = Number(document.getElementById("Nota").value);
    const fechaValor = document.getElementById("Fecha").value;

    try {
        // Alta de nota  alumno y asignatura seleccionada.
        const notaResponse = await fetch("/api/NotaAlumnoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                alumnoID: alumnoId,
                asignaturaID: asignaturaId,
                nota: notaValor,
                fecha: fechaValor ? new Date(fechaValor).toISOString() : new Date().toISOString()
            })
        });

        if (!notaResponse.ok) {
            const msg = await notaResponse.text();
            throw new Error(msg || "No se pudo crear la nota");
        }

        // Limpia formulario, cierra modal y refresca tabla.
        document.getElementById("selectAlumno").value = "";
        document.getElementById("selectAsignaturas").value = "";
        document.getElementById("Nota").value = "";
        document.getElementById("Fecha").value = "";

        let modal = bootstrap.Modal.getInstance(document.getElementById("modalAlumnos"));
        modal.hide();
        obtenerNotaAlumnos();
    } catch (error) {
        console.log("Error al crear la nota:", error);
        alert("No se pudo guardar: " + error.message);
    }
}


// Pide el registro por ID y carga los datos en el modal de edicion.
// Tambien espera que se carguen las asignaturas.
async function MostrarModalEditar(id, alumnoId, asignaturaId){
    try {
        const response = await fetch(`/api/NotaAlumnoes/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

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

        // Espera que se carguen las asignaturas antes de seleccionar la actual.
        await cargarAsignaturas();

        const asignaturaActual = asignaturaId ?? data.asignaturaID ?? data.asignaturaId;
        document.getElementById("editarAsignatura").value = asignaturaActual;

        let modal = new bootstrap.Modal(document.getElementById("editarAlumnoModal"));
        modal.show();
    } catch (error) {
        console.log("Error al obtener el alumno:", error);
    }
}

// Actualiza los datos del alumno y la nota 
// Usa los IDs guardados 
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

        //Limpia campos, cierra modal y refresca
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


//confirma antes de eliminar.
function EliminarAlumno (id) {
    var Eliminar = confirm("¿Está seguro de eliminar el alumno?");
    if (Eliminar==true) {
        EliminarSi(id);
    }
}


// Elimina la nota del alumno y carga la tabla.
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