const { Pool } = require("pg");
const format = require("pg-format");
require("dotenv").config();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  allowExitOnIdle: true,
});

const getJewels = async ({
  limits = 3,
  order_by = "nombre_ASC",
  page = 1,
}) => {
  const [field, direction] = order_by.split("_");
  const offset = (page - 1) * limits;

  const conteoTotal = "SELECT COUNT(*) FROM inventario"
  const {rows: [{count: total}]} = await pool.query(conteoTotal)
  const formattedQuery = format(
    "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
    field,
    direction,
    limits,
    offset
  );
  const { rows: jewels } = await pool.query(formattedQuery);
  return {jewels, total: parseInt(total)};
};

const filteredJewels = async ({ precio_min, precio_max, stock_min, categoria, metal }) => {
  let filters = [];
  let values = [];

  const addFilter = (field, comparison, value) => {
    values.push(value);
    const { length } = filters;
    filters.push(`${field} ${comparison} $${length + 1}`);
  };
  if (precio_min) addFilter("precio", ">=", precio_min);
  if (precio_max) addFilter("precio", "<=", precio_max);
  if (stock_min) addFilter("stock", ">=", stock_min);
  if (categoria) addFilter("categoria", "=", categoria)
  if (metal) addFilter("metal", "=", metal);
  let consult = "SELECT * FROM inventario";
  if (filters.length > 0) {
    filters = filters.join(" AND ")
    consult += ` WHERE ${filters}`
  }
  const { rows: jewels} = await pool.query(consult, values)
  return jewels
};

const generateHATEOAS = ({jewels, total}) => {
  const results = jewels
    .map((j) => {
      return {
        name: j.nombre,
        url: `/joyas/joya/${j.id}`,
      };
    })

  const HATEOAS = {
    total,
    results,
  };
  return HATEOAS;
};
module.exports = { getJewels, generateHATEOAS, filteredJewels };
