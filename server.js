const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-32377018282451-122410-982d3f08a2344cad61562e62c4b7904b-1160620932",
});

const preference = new Preference(client);

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint para crear la preferencia
app.post("/api/create_preference", async (req, res) => {
  try {
    let { items } = req.body;

    // Reescribir los items, cambiar name por title y price por unit_price
    items = items.map((item) => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    console.log("Items recibidos:", items);

    if (!items || !Array.isArray(items)) {
      throw new Error("La solicitud debe incluir un array de items.");
    }

    const mappedItems = items.map((item) => {
      if (!item.title || !item.quantity || !item.unit_price) {
        throw new Error("Cada item debe tener title, quantity y unit_price.");
      }

      return {
        title: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price), // Convertir a número si no lo es
        currency_id: "ARS",
      };
    });

    const result = await preference.create({
      body: {
        items: mappedItems,
        back_urls: {
          success: "https://your-website.com/success",
          failure: "https://your-website.com/failure",
          pending: "https://your-website.com/pending",
        },
        auto_return: "approved",
      },
    });

    console.log("Resultado de la preferencia:", result);

    // Verifica si la respuesta contiene 'body' y si tiene la propiedad 'id'
    if (result && result.id) {
      res.json({ preferenceId: result.id });
    } else {
      console.error("Error: No se recibió un 'id' válido en la respuesta.");
      res
        .status(500)
        .json({ error: "No se pudo obtener un id de la preferencia." });
    }
  } catch (error) {
    console.error("Error creando la preferencia:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al crear la preferencia" });
  }
});

// Iniciar el servidor
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
