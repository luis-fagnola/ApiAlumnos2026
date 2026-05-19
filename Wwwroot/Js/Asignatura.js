// Pide todas las asignaturas  arma la tabla con los datos.

function cargarAsignaturas() {
	fetch("/api/Asignaturas")
		.then((response) => response.json())
		.then((data) => {
			const tabla = document.getElementById("tablaAsignaturas");
			tabla.innerHTML = "";

			data.forEach((asignatura) => {
				tabla.innerHTML += `
					<tr>
						<td>${asignatura.asignaturaID}</td>
						<td>${asignatura.descripcion}</td>
						<td>${asignatura.eliminado ? "Si" : "No"}</td>
						<td>
							<button class="btn btn-sm btn-warning" onclick="editarAsignatura(${asignatura.asignaturaID}, '${asignatura.descripcion.replace(/'/g, "\\'")}', ${asignatura.eliminado})">Editar</button>
							<button class="btn btn-sm btn-danger" onclick="eliminarAsignatura(${asignatura.asignaturaID})">Eliminar</button>
						</td>
					</tr>`;
			});
		})
		.catch(() => alert("Error al cargar asignaturas"));
}

// crea una nueva asignatura.
// Si el campo esta vacio muestra un alerta y no envia nada.
function crearAsignatura() {
	const descripcion = document.getElementById("Descripcion").value.trim();

	if (!descripcion) {
		alert("La descripcion es obligatoria");
		return;
	}

	fetch("/api/Asignaturas", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ descripcion: descripcion, eliminado: false })
	})
		.then(() => {
			document.getElementById("Descripcion").value = "";
			cargarAsignaturas();
		})
		.catch(() => alert("Error al crear asignatura"));
}

// Edita la descripcion de una asignatura y si esta eliminada o no.

// Luego envia los cambios.
function editarAsignatura(id, descripcionActual, eliminadoActual) {
	const nuevaDescripcion = prompt("Nueva descripcion:", descripcionActual);
	if (nuevaDescripcion === null) {
		return;
	}

	const descripcion = nuevaDescripcion.trim();
	if (!descripcion) {
		alert("La descripcion es obligatoria");
		return;
	}

	const eliminado = confirm("Marcar como eliminada? Aceptar = Si, Cancelar = No");

	fetch(`/api/Asignaturas/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ asignaturaID: id, descripcion: descripcion, eliminado: eliminado })
	})
		.then(() => cargarAsignaturas())
		.catch(() => alert("Error al editar asignatura"));
}

// Pide confirmacion al usuario antes de eliminar.
// Si acepta envia hace DELETE y recarga la tabla.
function eliminarAsignatura(id) {
	if (!confirm("Desea eliminar esta asignatura?")) {
		return;
	}

	fetch(`/api/Asignaturas/${id}`, { method: "DELETE" })
		.then(() => cargarAsignaturas())
		.catch(() => alert("Error al eliminar asignatura"));
}

cargarAsignaturas();


