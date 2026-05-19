// Carga las asignaturas 
// inicializa las fechas por defecto.
async function ObtenerAsignaturas () {
   
        const respuesta = await fetch("/api/Asignaturas", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const asignaturas = await respuesta.json();
        const select = document.querySelector("#selecionarAsignatura");
        select.innerHTML = "";

        var opciones = "<option value='' disabled selected>Seleccionar asignatura</option>";
        asignaturas.forEach((asignatura) => {
            opciones += `<option value="${asignatura.asignaturaID}">${asignatura.descripcion}</option>`;
        });
        select.innerHTML = opciones;
        IniciarFechas();
    }

// Pone las fechas por defecto desde el primer dia del mes actual hasta hoy.
function IniciarFechas() {
    const hoy = new Date();
    
    const fechaDesde = hoy.getFullYear() + '-' +
        String(hoy.getMonth() + 1).padStart(2, '0') + '-01';

    const fechaHasta = hoy.getFullYear() + '-' +
        String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoy.getDate()).padStart(2, '0');

    document.getElementById("FechaDesdeBuscar").value = fechaDesde;
    document.getElementById("FechaHastaBuscar").value = fechaHasta;
}
    // Ordena los alumnos  por nombre o por promedio.
    let alumnosActuales = [];
    function ordenarAlumnos(alumnos) {  
        const criterio = document.getElementById("ordenPromedioAlumnos").value;
        const alumnosOrdenados = [...alumnos]
            

        // Si el criterio es promedio, ordena por promedio de mayor a menor.
        if (criterio === "promedio") {
            return alumnosOrdenados.sort((a, b) => b.promedio - a.promedio);
        }
        return alumnosOrdenados.sort((a, b) => {
            const nombreA = (a.nombre || "").toString();
            const nombreB = (b.nombre || "").toString();
            return nombreA.localeCompare(nombreB, "es" ,{ sensitivity: "base" });
        }); 
}

// Muestra la tabla con los promedios de cada alumno.
function MuestraTablaPromedios(alumnos) {
    const tbody = document.querySelector("#tablaPromedio");
    tbody.innerHTML = "";

    if (alumnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay datos disponibles</td></tr>`;
        return;
    }

    alumnos.forEach(alumno => {
        const rowInsertar = document.createElement("tr");
        rowInsertar.innerHTML = `          
            <td>${alumno.nombre}</td>   
            <td>${alumno.apellido}</td>
            <td class="text-center">${alumno.dNI || alumno.dni}</td>
            <td class="text-center text-bold">${alumno.promedio.toFixed(2)}</td>
        `;
        tbody.appendChild(rowInsertar);
    });
}

// el usuario cambia la asignatura, vuelve a buscar los promedios.
const inputCategoria = document.getElementById("selecionarAsignatura");
inputCategoria.onchange = function () {
    getPromedioAlumnos();
};

//el usuario cambia la fecha desde, vuelve a buscar los promedios.
const inputFechaDesde = document.getElementById("FechaDesdeBuscar");
inputFechaDesde.onchange = function () {
    getPromedioAlumnos();
};

//el usuario cambia la fecha hasta, vuelve a buscar los promedios.
const inputFechaHasta = document.getElementById("FechaHastaBuscar");
inputFechaHasta.onchange = function () {
    getPromedioAlumnos();
};


//cambia el orden, reordena .
const inputOrden = document.getElementById("ordenPromedioAlumnos");
inputOrden.onchange = function () {
    const alumnosOrdenados = ordenarAlumnos(alumnosActuales);
    MuestraTablaPromedios(alumnosOrdenados);
};

//  filtros de fecha y asignatura seleccionados.
// Si la fecha desde es mayor que hasta, las iguala 
// Arma la tabla con el promedio de cada alumno.
async function getPromedioAlumnos() {
    let fechaDesde = document.getElementById("FechaDesdeBuscar").value;
    let fechaHasta = document.getElementById("FechaHastaBuscar").value;

    const fecha1 = new Date(fechaDesde);
    const fecha2 = new Date(fechaHasta);

    if (fecha1 > fecha2) {
        fechaHasta = fechaDesde;
        document.getElementById("FechaHastaBuscar").value = fechaDesde;
    }

    const asignaturaID = document.getElementById("selecionarAsignatura").value;
    
    if (!asignaturaID) {
        alert("selecciona una asignatura");
        return;
    }

    const filtros = {
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        asignaturaID: parseInt(asignaturaID)
    };

    try {
        const res = await fetch(`/api/NotaAlumnoes/promedioalumnos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filtros)
        });

        if (!res.ok) {
            throw new Error("Error en la solicitud");
        }
       // Guarda los alumnos actuales para poder reordenarlos 
       const alumnos = await res.json();
        alumnosActuales = alumnos;


            // Ordena los alumnos por el criterio seleccionado y muestra la tabla.
        const alumnosOrdenados = ordenarAlumnos(alumnosActuales);
        MuestraTablaPromedios(alumnosOrdenados);


    } catch (error) {
        console.error("Error:", error);
        alert("Error al obtener los promedios");
    }
}

//carga las asignaturas
ObtenerAsignaturas();

