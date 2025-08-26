import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.use(
  cors({
    origin: process.env.CLIENT_URL, // example: "http://localhost:5173" or your deployed frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.post("/api/payment/create-session", async (req, res) => {
  try {
    const priceId = process.env.STRIPE_PRODUCT_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: "Product price ID not configured" });
    }

    // Create checkout session for one-time product purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Phone Repairing",
            },
            unit_amount: 1000, // $10.00 in cents (10.00 * 100)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/?payment=cancel`,
      metadata: {
        productType: "Phone Repairing",
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

// Stripe webhook to handle payment events
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log(
          `✅ Payment completed for product: ${session.metadata.productType}`
        );
        // No user data is stored
      }
    } catch (error) {
      console.error(`❌ Webhook handler failed:`, error);
      return res.status(500).json({ error: "Webhook handler failed" });
    }

    res.status(200).json({ received: true });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
