const { MercadoPagoConfig, Preference } = require("mercadopago");

export default async function handler(req, res) {
  // Configurar MercadoPago
  const client = new MercadoPagoConfig({
    accessToken:
      "APP_USR-32377018282451-122410-982d3f08a2344cad61562e62c4b7904b-1160620932",
  });

  const preference = new Preference(client);

  if (req.method === "GET") {
    return res.status(200).send("Hello, World!");
  }

  if (req.method === "POST") {
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
        return res.json({ preferenceId: result.id });
      } else {
        console.error("Error: No se recibió un 'id' válido en la respuesta.");
        return res.status(500).json({
          error: "No se pudo obtener un id de la preferencia.",
        });
      }
    } catch (error) {
      console.error("Error creando la preferencia:", error);
      return res.status(500).json({
        error: error.message || "Error al crear la preferencia",
      });
    }
  }
}
