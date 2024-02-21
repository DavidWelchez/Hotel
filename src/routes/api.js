const express = require("express");
const router = express.Router();
const pool = require("../database");
const cors = require("cors");
router.use(cors());
router.use(express.json());

//RUTA GET HOTELES
router.get("/hoteles", async (req, res) => {
  const hoteles = await pool.query("SELECT * FROM hotel");
  res.json(hoteles);
});

//RUTA GET HOTEL DETAIL
router.get("/hoteles/detail/:id", async (req, res) => {
  const { id } = req.params;
  const hoteles = await pool.query("SELECT * FROM hotel WHERE id = ?", [id]);
  res.json(hoteles);
});

//RUTA GET PATROCINADORES
router.get("/patrocinadores", async (req, res) => {
  const patrocinadores = await pool.query("SELECT * FROM casafarmaceutica");
  res.json(patrocinadores);
});

//RUTA GET LUGARES
router.get("/lugares", async (req, res) => {
  const lugares = await pool.query("SELECT * FROM lugares");
  res.json(lugares);
});

//RUTA GET PRECONGRESOS
router.get("/precongresos", async (req, res) => {
  const precongreso = await pool.query("SELECT * FROM precongreso");
  res.json(precongreso);
});

//RUTA GET PRECONGRESOS DETALLES
router.get("/precongresos/detail/:id", async (req, res) => {
  const { id } = req.params;
  const precongresodetalle = await pool.query(
    "SELECT * FROM precongresodetalle WHERE precongresoId = ?",
    [id]
  );
  res.json(precongresodetalle);
});

//RUTA GET PRECONGRESOS MODERADORES
router.get("/precongresos/mod/:id", async (req, res) => {
  const { id } = req.params;
  const precongresomoderador = await pool.query(
    "SELECT * FROM precongresomoderador WHERE precongresoId = ?",
    [id]
  );
  res.json(precongresomoderador);
});

//RUTA GET CONGRESO POR DIA Y SALON
router.get("/congreso/:dia/:salon", async (req, res) => {
  const { dia } = req.params;
  const { salon } = req.params;
  const congreso = await pool.query(
    "SELECT * FROM congresoapp WHERE dia = ? AND salon = ?",
    [dia, salon]
  );
  res.json(congreso);
});

//RUTA GET CONGRESO MODERADORES POR DIA, SALON Y HORA
router.get("/congreso/mod/:dia/:salon/:hora", async (req, res) => {
  const { dia } = req.params;
  const { salon } = req.params;
  const { hora } = req.params;
  const moderadores = await pool.query(
    "SELECT M.id, M.congresoId, M.moderador, M.hora " +
    "FROM congresoappmoderador M " +
    "INNER JOIN congresoapp C ON M.congresoId = C.id " +
    "WHERE C.dia = ? AND C.salon = ? AND M.hora = ?",
    [dia, salon, hora]
  );
  res.json(moderadores);
});

//RUTA GET CONGRESO DETALLES POR DIA, SALON Y HORA
router.get("/congreso/detail/:dia/:salon/:hora", async (req, res) => {
  const { dia } = req.params;
  const { salon } = req.params;
  const { hora } = req.params;
  const congresodetalles = await pool.query(
    "SELECT D.id, D.congresoId, D.time, D.horaFinal, D.codigo, D.title, D.description, D.hora,D.imageUrl " +
    "FROM congresoappdetalle D " +
    "INNER JOIN congresoapp C ON D.congresoId = C.id " +
    "WHERE C.dia = ? AND C.salon = ? AND D.hora = ?",
    [dia, salon, hora]
  );
  res.json(congresodetalles);
});

//RUTA GET POSTERS TRABAJOS LIBRES
router.get("/posters", async (req, res) => {
  const posters = await pool.query("SELECT * FROM poster");
  res.json(posters);
});

//RUTA GET SOCIOCULTURAL
router.get("/sociocultural/:dia", async (req, res) => {
  const { dia } = req.params;
  const socio = await pool.query("SELECT * FROM sociocultural WHERE dia = ?", 
  [dia]
  );
  res.json(socio);
});

module.exports = router;