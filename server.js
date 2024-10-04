const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors"); // Importamos cors
const app = express();
require("dotenv").config();

// Usamos cors para todas las rutas
app.use(cors());

// Configura tu API key de Google Maps a través de una variable de entorno
const GOOGLE_MAPS_API_KEY = "AIzaSyBY5fqHDVdAiWD6dLVGDLiaW1iqo_WV2qA";

// Proxy middleware para Google Places API
app.use(
  "/api/maps",
  createProxyMiddleware({
    target: "https://maps.googleapis.com",
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Reemplaza la URL de la solicitud para agregar los parámetros de ubicación
      const location = req.query.location;
      const radius = req.query.radius || 3000;
      const type = req.query.type || "hotel";
      const keyword = req.query.keyword || "hotel";

      return `/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&keyword=${keyword}&key=${GOOGLE_MAPS_API_KEY}`;
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
