// Obtener desde la API la lista de notas con sus datos de alumno.
function obtenerNotaAlumnos() {
    fetch("/api/NotaAlumnoes")
    .then ((response) => response.json())
    .then ((data) => MostrarNotaAlumnos(data))
    .catch ((error) => console.log('Error al obtener los alumnos:', error));
}

// Muestra la tabla principal de NotaAlumnos en pantalla.
   function MostrarNotaAlumnos(data) {
    $("#tablaAlumnos").empty();

    $.each(data, function (index, registro) {
    const id = registro.notaAlumnoID ?? registro.notaAlumnoId;
    const alumno = registro.alumno || {};
    const alumnoId = registro.alumnoID ?? registro.alumnoId ?? alumno.alumnoID ?? alumno.alumnoId;
    const asignaturaId = registro.asignaturaID ?? registro.asignaturaId;

        $("#tablaAlumnos").append(
            `<tr>
        <td>${id}</td>
        <td>${alumno.nombre ?? ""}</td>
        <td>${alumno.apellido ?? ""}</td>
        <td>${alumno.dNI ?? alumno.dni ?? ""}</td>
        <td>${registro.nota}</td>
                 <td class="text-center">
                    <button class="btn btn-sm btn-warning me-2"
            onclick="MostrarModalEditar(${id}, ${alumnoId}, ${asignaturaId})">
                        Editar
          </button>

                    <button class="btn btn-sm btn-danger"
                        onclick="EliminarAlumno(${id})">
                        Eliminar
          </button>
                </td>
            </tr>`);
    });
}

// Valida el formulario 
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

  let inputNota = document.getElementById("Nota");
  let errorNota = document.getElementById("errorNotaAlumno");
  let nota = inputNota.value.trim();

  errorNota.textContent = "";
  inputNota.classList.remove("is-invalid", "is-valid");

    // Limpia errores.
  errorNombre.textContent = "";
  inputNombre.classList.remove("is-invalid", "is-valid")

  errorApellido.textContent = "";
  inputApellido.classList.remove("is-invalid", "is-valid")

  errorDni.textContent = "";
  inputDni.classList.remove("is-invalid", "is-valid")

  let esValido = true;

    // Valida que el nombre no este vacio.
  if(!nombre){
    inputNombre.classList.add("is-invalid");
    errorNombre.textContent = "Campo obligatorio"
    esValido = false;
  } else {
    inputNombre.classList.remove("is-invalid");
    errorNombre.textContent = "";
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

    // Valida que el apellido no este vacio.
  if(!apellido){
    inputApellido.classList.add("is-invalid");
    errorApellido.textContent = "Campo obligatorio"
    esValido = false;
  } else {
    inputApellido.classList.remove("is-invalid");
    errorApellido.textContent = "";
  }

    // Valida el DNI.
  if(!dni) {
    inputDni.classList.add("is-invalid");
    errorDni.textContent = "Campo obligatorio"
    esValido = false;
  } else if (dni.length < 8 || dni.length > 11){
    inputDni.classList.add("is-invalid");
    errorDni.textContent = "Debe contener entre 8 y 11 digitos numericos"
    esValido = false;
  } else if (!dni.match(/^\d+$/)){
    inputDni.classList.add("is-invalid");
    errorDni.textContent = "Debe contener solo digitos numericos"
    esValido = false;
  } else {
    inputDni.classList.remove("is-invalid")
    errorDni.textContent = "";
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

        if (!Number.isFinite(notaValor) || notaValor < 1 || notaValor > 10) {
            document.getElementById("Nota").classList.add("is-invalid");
            document.getElementById("errorNotaAlumno").textContent = "La nota debe estar entre 1 y 10";
            return;
        }

        let alumno = {
            nombre: document.getElementById("Nombre").value,
            apellido: document.getElementById("Apellido").value,
            dni: document.getElementById("Dni").value,
            sexo: 3,
            domicilio: "Sin domicilio"
        };

        try {
            //  Alta de alumno.
            const alumnoResponse = await fetch("/api/Alumnos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(alumno)
            });

            if (!alumnoResponse.ok) {
                const msg = await alumnoResponse.text();
                throw new Error(msg || "No se pudo crear el alumno");
            }

            const alumnoCreado = await alumnoResponse.json();
            const alumnoId = alumnoCreado.alumnoID ?? alumnoCreado.alumnoId;

            //  Busca asignaturas para asociar la nota.
            const asignaturasResponse = await fetch("/api/Asignaturas");
            if (!asignaturasResponse.ok) {
                const msg = await asignaturasResponse.text();
                throw new Error(msg || "No se pudieron obtener las asignaturas");
            }

            const asignaturas = await asignaturasResponse.json();
            if (!Array.isArray(asignaturas) || asignaturas.length === 0) {
                throw new Error("Debe crear al menos una asignatura antes de cargar notas");
            }

            const asignaturaId = asignaturas[0].asignaturaID ?? asignaturas[0].asignaturaId;

            // Alta de nota vinculada al alumno y asignatura.
            const notaResponse = await fetch("/api/NotaAlumnoes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    alumnoID: alumnoId,
                    asignaturaID: asignaturaId,
                    nota: notaValor
                })
            });

            if (!notaResponse.ok) {
                const msg = await notaResponse.text();
                throw new Error(msg || "No se pudo crear la nota");
            }

            // Limpia formulario, cierra modal y refresca tabla.
            document.getElementById("Nombre").value = "";
            document.getElementById("Apellido").value = "";
            document.getElementById("Dni").value = "";
            document.getElementById("Nota").value = "";

            let modal= bootstrap.Modal.getInstance(document.getElementById("modalAlumnos"));
            modal.hide();
            obtenerNotaAlumnos();
        } catch (error) {
            console.log("Error al crear el alumno:", error);
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

        let modal = new bootstrap.Modal(document.getElementById("editarAlumnoModal"));
        modal.show();
    })
    .catch((error) => console.log("Error al obtener el alumno:", error));
}

// Actualiza alumno y nota en la API usando los IDs guardados en el modal.
async function EditarAlumno() {
    if (!ValidarFormularioEditar()) {
        return;
    }

    let id= parseInt(document.getElementById("editarId").value);
    const hiddenId = document.getElementById("editarId");
    const alumnoId = Number(hiddenId.dataset.alumnoId);
    const asignaturaId = Number(hiddenId.dataset.asignaturaId);
    const notaValor = Number(document.getElementById("editarNota").value);

    let alumno = {
        alumnoID: alumnoId,
        nombre: document.getElementById("editarNombre").value,
        apellido: document.getElementById("editarApellido").value,
        dni: document.getElementById("editarDni").value,
        sexo: 3,
        domicilio: "Sin domicilio"
    };

    let notaAlumno = {
        notaAlumnoID: id,
        alumnoID: alumnoId,
        asignaturaID: asignaturaId,
        nota: notaValor
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