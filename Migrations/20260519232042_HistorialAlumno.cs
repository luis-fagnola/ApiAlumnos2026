using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiAlumnos2026.Migrations
{
    /// <inheritdoc />
    public partial class HistorialAlumno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HistorialNotaAlumnos_NotasAlumnos_NotaAlumnoID",
                table: "HistorialNotaAlumnos");

            migrationBuilder.DropIndex(
                name: "IX_HistorialNotaAlumnos_NotaAlumnoID",
                table: "HistorialNotaAlumnos");

            migrationBuilder.AlterColumn<string>(
                name: "CampoModificado",
                table: "HistorialNotaAlumnos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "HistorialAlumnos",
                columns: table => new
                {
                    HistorialAlumnoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlumnoID = table.Column<int>(type: "int", nullable: false),
                    CampoModificado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorAnterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorNuevo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCambio = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialAlumnos", x => x.HistorialAlumnoID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistorialAlumnos");

            migrationBuilder.AlterColumn<string>(
                name: "CampoModificado",
                table: "HistorialNotaAlumnos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialNotaAlumnos_NotaAlumnoID",
                table: "HistorialNotaAlumnos",
                column: "NotaAlumnoID");

            migrationBuilder.AddForeignKey(
                name: "FK_HistorialNotaAlumnos_NotasAlumnos_NotaAlumnoID",
                table: "HistorialNotaAlumnos",
                column: "NotaAlumnoID",
                principalTable: "NotasAlumnos",
                principalColumn: "NotaAlumnoID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
