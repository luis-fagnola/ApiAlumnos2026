using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAlumnos2026.Migrations
{
    /// <inheritdoc />
    public partial class NuevaEstructura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notas");

            migrationBuilder.CreateTable(
                name: "Alumnos",
                columns: table => new
                {
                    AlumnoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DNI = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sexo = table.Column<int>(type: "int", nullable: false),
                    Domicilio = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alumnos", x => x.AlumnoID);
                });

            migrationBuilder.CreateTable(
                name: "Asignaturas",
                columns: table => new
                {
                    AsignaturaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asignaturas", x => x.AsignaturaID);
                });

            migrationBuilder.CreateTable(
                name: "Docentes",
                columns: table => new
                {
                    DocenteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DNI = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sexo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Docentes", x => x.DocenteID);
                });

            migrationBuilder.CreateTable(
                name: "NotasAlumnos",
                columns: table => new
                {
                    NotaAlumnoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlumnoID = table.Column<int>(type: "int", nullable: false),
                    AsignaturaID = table.Column<int>(type: "int", nullable: false),
                    Nota = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotasAlumnos", x => x.NotaAlumnoID);
                    table.ForeignKey(
                        name: "FK_NotasAlumnos_Alumnos_AlumnoID",
                        column: x => x.AlumnoID,
                        principalTable: "Alumnos",
                        principalColumn: "AlumnoID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NotasAlumnos_Asignaturas_AsignaturaID",
                        column: x => x.AsignaturaID,
                        principalTable: "Asignaturas",
                        principalColumn: "AsignaturaID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotasAlumnos_AlumnoID",
                table: "NotasAlumnos",
                column: "AlumnoID");

            migrationBuilder.CreateIndex(
                name: "IX_NotasAlumnos_AsignaturaID",
                table: "NotasAlumnos",
                column: "AsignaturaID");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotasAlumnos");

            migrationBuilder.DropTable(
                name: "Alumnos");

            migrationBuilder.DropTable(
                name: "Asignaturas");

            migrationBuilder.DropTable(
                name: "Docentes");

            migrationBuilder.CreateTable(
                name: "Notas",
                columns: table => new
                {
                    AlumnoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DNI = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nota = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas", x => x.AlumnoID);
                });
        }
    }
}
