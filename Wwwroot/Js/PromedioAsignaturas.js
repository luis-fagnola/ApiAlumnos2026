// Inicializa las fechas 
function iniciarFechas() {
	const hoy = new Date();
	const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

	document.getElementById("FechaDesdeBuscar").value = primerDia.toISOString().slice(0, 10);
	document.getElementById("FechaHastaBuscar").value = hoy.toISOString().slice(0, 10);
}

// Carga las asignaturas desde la API y las agrega 
async function cargarAsignaturas() {
	const respuesta = await fetch("/api/Asignaturas");
	if (!respuesta.ok) {
		throw new Error("No se pudieron obtener las asignaturas");
	}

	const asignaturas = await respuesta.json();
	const select = document.getElementById("selectAsignaturas");
	select.innerHTML = "<option value='0' selected>Todas las asignaturas</option>";

	asignaturas.forEach((asignatura) => {
		const id = asignatura.asignaturaID ?? asignatura.asignaturaId;
		const descripcion = asignatura.descripcion ?? "Sin descripcion";
		select.innerHTML += `<option value="${id}">${descripcion}</option>`;
	});
}

// Carga los alumnos desde la API y los agrega 
async function cargarAlumnos() {
	const respuesta = await fetch("/api/Alumnos");
	if (!respuesta.ok) {
		throw new Error("No se pudieron obtener los alumnos");
	}

	const alumnos = await respuesta.json();
	const select = document.getElementById("selectAlumnos");
	select.innerHTML = "<option value='0' selected>Todos los alumnos</option>";

	alumnos.forEach((alumno) => {
		const id = alumno.alumnoID ?? alumno.alumnoId;
		const apellido = alumno.apellido ?? "";
		const nombre = alumno.nombre ?? "";
		const dni = alumno.dNI ?? alumno.dni ?? "-";
		select.innerHTML += `<option value="${id}">${apellido}, ${nombre} (${dni})</option>`;
	});
}

// Muestra los promedios en la tabla
function mostrarTabla(promedios) {
	const tbody = document.getElementById("tablaPromedioAsignaturas");
	tbody.innerHTML = "";

	if (!Array.isArray(promedios) || promedios.length === 0) {
		tbody.innerHTML = "<tr><td colspan='2' class='text-center'>No hay datos disponibles</td></tr>";
		return;
	}

	promedios.forEach((item) => {
		const nombre = item.asignaturaNombre ?? "Sin asignatura";
		const promedio = Number(item.promedio ?? 0).toFixed(2);

		const fila = document.createElement("tr");
		fila.innerHTML = `
			<td>${nombre}</td>
			<td class="text-center">${promedio}</td>
		`;
		tbody.appendChild(fila);
	});
}

// Obtiene los filtros seleccionados por el usuario
function obtenerFiltros() {
	let fechaDesde = document.getElementById("FechaDesdeBuscar").value;
	let fechaHasta = document.getElementById("FechaHastaBuscar").value;

	// Ajusta las fechas si la fecha de inicio es mayor que la de fin
	if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
		fechaHasta = fechaDesde;
		document.getElementById("FechaHastaBuscar").value = fechaDesde;
	}

	return {
		fechaDesde,
		fechaHasta,
		asignaturaID: parseInt(document.getElementById("selectAsignaturas").value || "0", 10),
		alumnoID: parseInt(document.getElementById("selectAlumnos").value || "0", 10)
	};
}

// Carga los promedios de las asignaturas desde la API y los muestra en la tabla
async function cargarPromediosAsignatura() {
	try {
		const filtros = obtenerFiltros();

		const respuesta = await fetch("/api/PromedioAsignatura/promedioasignaturas", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(filtros)
		});

		if (!respuesta.ok) {
			throw new Error("No se pudieron obtener los promedios");
		}

		const datos = await respuesta.json();
		const lista = Array.isArray(datos) ? datos : (datos.value ?? []);
		mostrarTabla(lista);
	} catch (error) {
		console.error(error);
		mostrarTabla([]); // Muestra una tabla vacía en caso de error
	}
}

//  eventos para actualizar los datos al cambiar los filtros
function configurarEventos() {
	document.getElementById("FechaDesdeBuscar").addEventListener("change", cargarPromediosAsignatura);
	document.getElementById("FechaHastaBuscar").addEventListener("change", cargarPromediosAsignatura);
	document.getElementById("selectAsignaturas").addEventListener("change", cargarPromediosAsignatura);
	document.getElementById("selectAlumnos").addEventListener("change", cargarPromediosAsignatura);
}

// Inicializa la página cargando datos y eventos
async function iniciarPromedioAsignaturas() {
	iniciarFechas(); // Establece las fechas 
	await Promise.all([cargarAsignaturas(), cargarAlumnos()]); // Carga las asignaturas y alumnos 
	configurarEventos(); // Configura los eventos para los filtros
	await cargarPromediosAsignatura(); // Carga los promedios 
}

iniciarPromedioAsignaturas(); // Llama a la función principal para iniciar todo
