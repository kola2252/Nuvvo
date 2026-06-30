import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { FOOD_CATALOG } from "./src/data/catalog";

dotenv.config();

// Helper to perform robust model calls with a lightweight backup and automatic retry
async function callGeminiWithFallback(ai: any, params: { model?: string; contents: any; config?: any }) {
  const { config, contents } = params;
  
  // Try 1: Primary Model (gemini-3.5-flash)
  try {
    return await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config,
    });
  } catch (err: any) {
    const isServiceError = String(err?.message || err).includes("503") || 
                           String(err?.message || err).includes("UNAVAILABLE") ||
                           String(err?.message || err).includes("limit") ||
                           String(err?.message || err).includes("429");
    if (isServiceError) {
      console.log("Notice: Primary model temporarily busy, transitioning to secondary backup model.");
    }
  }

  // Try 2: Secondary Model (gemini-3.1-flash-lite)
  try {
    return await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config,
    });
  } catch (err2: any) {
    // If both failed, propagate quietly
    throw err2;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini recommendations
  app.post("/api/recommendations", async (req, res) => {
    const { orders, catalog } = req.body;

    try {
      if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
        return res.status(400).json({ error: "Catalog is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Notice: GEMINI_API_KEY is not defined. Returning a signature/trending fallback item.");
        if (catalog && Array.isArray(catalog) && catalog.length > 0) {
          const fallbackItem = catalog.find((f: any) => f.isBestSeller || f.rating >= 4.5) || catalog[0];
          return res.json({
            foodId: fallbackItem.id,
            reason: "⭐ Chef's Premium Selection: Award-winning recipe!",
            isFallback: true
          });
        }
        return res.status(400).json({ error: "Catalog is empty" });
      }

      // Initialize Gemini Client lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Format user's past orders concisely to feed to Gemini
      const ordersDesc = (orders || [])
        .map((o: any, idx: number) => {
          const items = (o.items || [])
            .map((i: any) => `${i.foodItem?.name || i.foodItemId} (qty: ${i.quantity})`)
            .join(", ");
          return `Order #${idx + 1} Status: ${o.status || 'completed'} - Items: ${items}`;
        })
        .join("\n");

      // Format catalog details
      const catalogDesc = catalog
        .map((f: any) => {
          return `- ID: ${f.id}, Name: ${f.name}, Category: ${f.category}, Description: ${f.description}, Price: ₹${f.price}, Veg/NonVeg: ${f.vegIndicator || 'Unknown'}`;
        })
        .join("\n");

      const prompt = `You are a world-class culinary AI sommelier and personal diet analyst.
Recommend ONE exactly matching food item from our restaurant catalog that is most suitable for this user based on their order history.

Here is the user's past order history:
${ordersDesc || "No past orders yet. The user is a first-time customer."}

Here is the catalog of currently available food items with their details:
${catalogDesc}

Requirements:
1. Under past order history, analyze the user's cuisine preferences (Veg vs Nonveg, heavy vs snacks, spices, categories like pizza, biryani, burgers, desserts).
2. Choose exactly ONE foodId from the provided catalog that matches their palette best. If they have no order history, recommend a highly popular signature dish.
3. Write a fun, delicious, motivating, highly personalized reasoning explaining why this dish is perfect for them (maximum 12 words, e.g., "Loved your spiced biryanis? Experience this chef's master curry now!"). Make it sound appetizing!

You MUST respond strictly with a valid JSON document matching this schema:
{
  "foodId": "the string ID matching the selected item from the catalog",
  "reason": "delicious personalized short reasoning under 12 words"
}`;

      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodId: {
                type: Type.STRING,
                description: "The unique ID of the recommended food item from the catalog",
              },
              reason: {
                type: Type.STRING,
                description: "Personalized highly engaging reasoning under 12 words",
              },
            },
            required: ["foodId", "reason"],
          }
        }
      });

      const text = response.text?.trim() || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (err: any) {
      console.log("Notice: Serving signature/trending fallback item as recommended option.");

      // Safe local fallback selection
      try {
        if (catalog && Array.isArray(catalog) && catalog.length > 0) {
          // Choose a premium special or highly rated item
          const fallbackItem = catalog.find((f: any) => f.isBestSeller || f.rating >= 4.5) || catalog[0];
          return res.json({
            foodId: fallbackItem.id,
            reason: "⭐ Chef's Premium Selection: Award-winning recipe!",
            isFallback: true
          });
        }
      } catch (fallbackErr) {
        // Fallback option extraction failed
      }

      res.status(500).json({ status: "unavailable" });
    }
  });

  // API route for dynamically fetching and filtering food items based on selected tags like 'Breakfast', 'Dinner', 'Snacks', or 'Healthy'
  app.get("/api/food-items", (req, res) => {
    const { tag } = req.query;

    if (!tag) {
      return res.json(FOOD_CATALOG);
    }

    const targetTag = String(tag).trim().toLowerCase();

    // If tag is 'all', return all
    if (targetTag === 'all') {
      return res.json(FOOD_CATALOG);
    }

    const filtered = FOOD_CATALOG.filter(item => {
      const cat = item.category.toLowerCase();
      const sub = (item.subcategory || '').toLowerCase();
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();

      if (targetTag === 'breakfast') {
        return (
          cat.includes('tiffin') || 
          cat.includes('south indian') || 
          cat.includes('tea & coffee') ||
          sub.includes('breakfast') || 
          sub.includes('idli') || 
          sub.includes('dosa') || 
          sub.includes('upma') ||
          name.includes('breakfast') || 
          name.includes('idli') || 
          name.includes('dosa')
        );
      }

      if (targetTag === 'dinner') {
        return (
          cat.includes('biryani') || 
          cat.includes('north indian') || 
          cat.includes('chinese') || 
          cat.includes('chicken') || 
          cat.includes('mutton') || 
          cat.includes('seafood') || 
          cat.includes('combo') || 
          cat.includes('dinner') ||
          sub.includes('dinner') || 
          sub.includes('curry') || 
          sub.includes('mandi') || 
          sub.includes('gravy') || 
          name.includes('dinner') || 
          name.includes('thali') || 
          name.includes('biryani')
        );
      }

      if (targetTag === 'snacks') {
        return (
          cat.includes('fast food') || 
          cat.includes('pizza') || 
          cat.includes('burger') || 
          cat.includes('sandwich') || 
          cat.includes('rolls') || 
          cat.includes('shawarma') || 
          cat.includes('bakery') || 
          cat.includes('kids') || 
          cat.includes('snack') ||
          cat.includes('dessert') ||
          cat.includes('ice cream') ||
          cat.includes('milkshake') ||
          sub.includes('snack') || 
          sub.includes('fries') || 
          sub.includes('nuggets') || 
          sub.includes('bite') || 
          name.includes('snack') || 
          name.includes('fries') || 
          name.includes('burger') || 
          name.includes('pizza')
        );
      }

      if (targetTag === 'healthy') {
        return (
          cat.includes('healthy') || 
          cat.includes('juice') || 
          desc.includes('healthy') || 
          desc.includes('protein') || 
          desc.includes('salad') || 
          desc.includes('fresh') || 
          desc.includes('fiber') || 
          desc.includes('vitamins') || 
          desc.includes('keto') || 
          desc.includes('diet') ||
          name.includes('healthy') || 
          name.includes('salad') || 
          name.includes('oats') || 
          name.includes('sprouts')
        );
      }

      return false;
    });

    res.json(filtered);
  });

  // API route for generating dynamic gourmet food stories and preparation secrets
  app.post("/api/food-story", async (req, res) => {
    const { foodItem } = req.body;

    if (!foodItem || !foodItem.name) {
      return res.status(400).json({ error: "Food item is required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Notice: GEMINI_API_KEY is not defined. Returning custom fallback gourmet stories.");
        return res.json({
          story: `The legendary ${foodItem.name} is a masterpiece of modern gastromony. Born from our chef's relentless exploration of rich regional flavor profiles, every bite is crafted to deliver a complex, harmonious taste sensation that sings on your palate.`,
          visualPrep: `• Premium farm-fresh ${foodItem.ingredients ? foodItem.ingredients.slice(0, 3).join(', ') : 'organic elements'} are hand-selected at sunrise.\n• Infused gently with cold-pressed artisan oils and authentic spices.\n• Slow-simmered at exact temperatures to lock in deep, natural umami and perfect tenderness.`
        });
      }

      // Initialize Gemini client lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an elite Michelin-star food writer, culinary visual artist, and storytelling sommelier.
Create a mesmerizing "AI Food Story" and a detailed "Visual Preparation Guide" for this gourmet item:

Name: ${foodItem.name}
Category: ${foodItem.category || 'Specialty'}
Description: ${foodItem.description || ''}
Ingredients: ${foodItem.ingredients ? foodItem.ingredients.join(', ') : 'Selected secret spices'}

Requirements:
1. **story**: A compelling, artistic, and highly appetizing 2-3 sentence narrative about this dish. Capture its sensory soul, flavor profiles, and culinary inspiration. Avoid generic phrases, make it sound like a premium editorial review!
2. **visualPrep**: A vivid, sensory, step-by-step description of how these exact ingredients are prepared with passion in our high-end kitchen. Use rich cooking actions (e.g., "slow-roasted over cherrywood fire", "glazed with cold-pressed mustard oil", "delicately hand-whipped"). Maximum 3 short, snappy bullet points.

You MUST respond strictly with a valid JSON document matching this schema:
{
  "story": "your sensory/artistic food story text",
  "visualPrep": "step 1 bullet...\\nstep 2 bullet...\\nstep 3 bullet..."
}`;

      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              story: {
                type: Type.STRING,
                description: "A sensory, high-end 2-3 sentence culinary narrative about the dish's flavor and soul.",
              },
              visualPrep: {
                type: Type.STRING,
                description: "Vivid, step-by-step description of preparation with up to 3 short bullet points separated by newlines.",
              },
            },
            required: ["story", "visualPrep"],
          }
        }
      });

      const text = response.text?.trim() || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (err: any) {
      console.log("Notice: Utilizing premium storyteller fallback profile.");
      // Fail gracefully with a beautiful rich fallback response
      res.json({
        story: `Our signature ${foodItem.name} showcases the pinnacle of artisan baking and gourmet seasoning. Balanced perfectly with a modern flair, it celebrates pure, fresh ingredients crafted to create an unforgettable dining experience.`,
        visualPrep: `• Prepared fresh to order with hand-sourced organic ${foodItem.ingredients ? foodItem.ingredients[0] : 'ingredients'}.\n• Slowly infused with fine garden herbs and curated chef blends.\n• Masterfully plated to order, preserving optimal textures, temperature, and taste profiles.`
      });
    }
  });

  // API route for Nuvvo AI Chatbot assistance
  app.post("/api/chatbot", async (req, res) => {
    const { message, history } = req.body;

    try {
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // High quality local support simulator fallback if no key is supplied
        const lower = message.toLowerCase();
        let reply = "Hi! I'm Nuvvo AI, your personal culinary concierge. I can guide you through our 90+ partner menus, track active orders in real-time, or explain how to start your own high-revenue franchise unit!";
        
        if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
          reply = "You can track your orders in real-time on our Live Tracking Screen! Our simulator displays dynamic GPS routing, rider telemetry updates, and estimated delivery times with high accuracy.";
        } else if (lower.includes("biryani") || lower.includes("spicy") || lower.includes("rice")) {
          reply = "Craving something rich? I highly recommend our Chef's Signature Dum Biryani! It is slow-cooked over a clay pot (dum process), perfectly spiced, and served with tangy salan and raita.";
        } else if (lower.includes("franchise") || lower.includes("partner") || lower.includes("business")) {
          reply = "Franchise opportunities with Nuvvo are highly lucrative! You can apply directly through our interactive Franchise screen with real-time ROI calculator, territory availability checks, and legal document uploads.";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hello there! Welcome to Nuvvo. What delicious food can I help you discover or track today?";
        } else if (lower.includes("pizza") || lower.includes("cheese")) {
          reply = "You must check out our Stone-Baked Pizzas under the Fast Food category! Loaded with fresh mozzarella and slow-simmered marinara sauce.";
        } else if (lower.includes("help") || lower.includes("support")) {
          reply = "I'm here for you! You can chat with me, track your delivery, or tap the WhatsApp button below to instantly connect with our 24/7 dedicated support desk.";
        }

        return res.json({ response: reply });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct conversational format
      const formattedHistory = (history || [])
        .slice(-10) // last 10 messages
        .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join("\n");

      const systemContext = `You are "Nuvvo AI", the official culinary concierge chatbot of Nuvvo Food Delivery app.
Your character is highly polished, professional, warm, conversational, and energetic.
Keep answers concise, direct, helpful, and focused on the Nuvvo app ecosystem.
Encourage ordering delicious meals, trying biryanis, tracking active deliveries with our simulator, or exploring franchise/partner programs.
Avoid lengthy or dry paragraphs; prioritize brevity (3-4 sentences maximum).

Chat History:
${formattedHistory}

Current User Query: ${message}`;

      const response = await callGeminiWithFallback(ai, {
        contents: systemContext,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ response: response.text?.trim() || "I'm here to assist you with your culinary needs today!" });
    } catch (err: any) {
      console.warn("Notice: Chatbot API had a runtime error, utilizing fallback simulator:", err?.message || err);
      res.json({ response: "I'm here to help! Could you please try again? I can help recommend foods, track orders, or connect you to support." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
