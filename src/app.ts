import express from "express";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API Voley Torneos funcionando" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar la base de datos:", error);
    process.exit(1);
  });

export default app;