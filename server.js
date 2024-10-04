const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors"); // Importamos cors
const app = express();
require("dotenv").config();

// Usamos cors para todas las rutas
app.use(cors());

// Configura tu API key de Google Maps a través de una variable de entorno
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Proxy middleware para Google Places API
app.use(
  "/api/maps",
  createProxyMiddleware({
    target: "https://maps.googleapis.com",
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Extraer parámetros de la solicitud
      const location = req.query.location;
      const radius = req.query.radius || 3000;
      const type = req.query.type || ""; // El tipo puede ser opcional
      const keyword = req.query.keyword || ""; // El keyword puede ser opcional

      // Construir la URL condicionalmente
      let newPath = `/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}`;

      // Solo agregar type si está definido
      if (type) {
        newPath += `&type=${type}`;
      }

      // Solo agregar keyword si está definido
      if (keyword) {
        newPath += `&keyword=${keyword}`;
      }

      // Agregar la API key
      newPath += `&key=${GOOGLE_MAPS_API_KEY}`;

      return newPath;
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*"; // Agregar encabezado CORS
    },
    onError: function (err, req, res) {
      res.status(500).json({ error: "Algo salió mal con el servidor proxy" });
    },
  })
);

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor proxy ejecutándose en el puerto ${PORT}`);
});
