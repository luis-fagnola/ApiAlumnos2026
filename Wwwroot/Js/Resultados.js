function cargarResultados() {
	fetch("/api/NotaAlumnoes")
		.then((response) => {
			if (!response.ok) {
				throw new Error("No se pudieron obtener los alumnos");
			}
			return response.json();
		})
		.then((alumnos) => mostrarResultados(alumnos))
		.catch(() => {
			document.getElementById("estadoGrupo").textContent = "Error al cargar resultados";
		});
}

function mostrarResultados(registros) {
	if (!Array.isArray(registros) || registros.length === 0) {
		document.getElementById("promedioGeneral").textContent = "0.00";
		document.getElementById("alumnoMasAlta").textContent = "Sin datos";
		document.getElementById("alumnoMasBaja").textContent = "Sin datos";
		document.getElementById("cantAprobados").textContent = "0";
		document.getElementById("cantDesaprobados").textContent = "0";
		document.getElementById("estadoGrupo").textContent = "Grupo en Riesgo";
		return;
	}

	let suma = 0;
	let aprobados = 0;
	let desaprobados = 0;
	let alumnoAlta = registros[0];
	let alumnoBaja = registros[0];

	registros.forEach((registro) => {
		const nota = Number(registro.nota);
		suma += nota;

		if (nota >= 6) {
			aprobados++;
		} else {
			desaprobados++;
		}

		if (nota > Number(alumnoAlta.nota)) {
			alumnoAlta = registro;
		}

		if (nota < Number(alumnoBaja.nota)) {
			alumnoBaja = registro;
		}
	});

	const promedio = suma / registros.length;
	const estado = promedio >= 6 ? "Grupo Aprobado" : "Grupo en Riesgo";

	const alumnoAltaData = alumnoAlta.alumno || {};
	const alumnoBajaData = alumnoBaja.alumno || {};
	const nombreAlta = `${alumnoAltaData.nombre || "Sin nombre"} ${alumnoAltaData.apellido || ""}`.trim();
	const nombreBaja = `${alumnoBajaData.nombre || "Sin nombre"} ${alumnoBajaData.apellido || ""}`.trim();

	document.getElementById("promedioGeneral").textContent = promedio.toFixed(2);
	document.getElementById("alumnoMasAlta").textContent = `${nombreAlta} (${alumnoAlta.nota})`;
	document.getElementById("alumnoMasBaja").textContent = `${nombreBaja} (${alumnoBaja.nota})`;
	document.getElementById("cantAprobados").textContent = aprobados;
	document.getElementById("cantDesaprobados").textContent = desaprobados;
	document.getElementById("estadoGrupo").textContent = estado;
}

cargarResultados();
