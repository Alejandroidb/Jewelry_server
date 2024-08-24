const express = require("express");
const { getJewels, filteredJewels, generateHATEOAS } = require("./consultas");
const app = express();
const PORT = process.env.PORT || 3000;
const logger = require("./logger")
app.use(express.json());
app.use(logger)

app.get("/joyas", async (req, res) => {
  try {
    const queryString = req.query;
    const inventario = await getJewels(queryString);
    const HATEOAS = generateHATEOAS(inventario);
    res.json(HATEOAS);
  } catch (error) {
    console.error("Error al traer Joyas:", error);
    res.status(500).json({ error: "Error al obtener el inventario" });
  }
});
app.get("/joyas/filtros", async (req, res) => {
  try {
    const queryString = req.query;
    const inventario = await filteredJewels(queryString);
    res.json(inventario);
  } catch (error) {
    console.error("Error al traer las Joyas", error);
    res.status(500).json({ error: "Error al obtener la joya filtrada" });
  }
});
app.get("*", (req, res) => {
  res.status(404).send("Ruta no encontrada");
});

app.listen(PORT, () => {
  console.log(`Servidor encendido en ${PORT}`);
});
