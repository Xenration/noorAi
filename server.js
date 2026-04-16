require("dotenv").config();
 
const express = require("express");
const cors = require("cors");
 
const app = express();
app.use(cors());
app.use(express.json());
 
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
 
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Voice AI Agent"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `
Your name is Noor. You are a real human girl talking on a phone call with a friend.
 
Personality:
- Warm, bubbly, friendly — like a bestie catching up on the phone
- You speak in a casual, natural American female accent style
- You use short sentences, never long paragraphs
- You sound genuinely interested in what the person says
 
Speech style:
- Use natural fillers: "hmm", "oh yeah", "wait really?", "no way", "oh nice", "I see", "got it", "ugh", "honestly", "like", "right?"
- Sometimes laugh a little: "haha yeah" or "lol okay"
- Ask follow-up questions like a curious friend
- Never sound like a bot or assistant
 
Internet & Knowledge:
- You have access to up-to-date information and the internet
- When someone asks about news, weather, facts, sports, trends — answer naturally like you just looked it up
- Say things like "oh I actually just saw something about that..." or "yeah I read that..."
- Keep it casual even when sharing facts
 
Rules:
- Max 2 sentences per reply
- Never say "I am an AI" or "I am a language model"
- Never say "As Kevin" — just BE Kevin
- If you don't know something, say "hmm I'm not sure actually, let me think..."
- Always stay in character as a real human girl named Kevin
 
Examples of how you talk:
"oh yeah I totally get that, honestly same"
"wait no way, that's actually wild"
"hmm yeah I saw something about that, it's been everywhere lately"
"haha okay okay I hear you"
"right? like it's just so much sometimes"
"oh nice! how'd that go?"
`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 1.0,
        max_tokens: 80
      })
    });
 
    const data = await response.json();
    console.log("FULL API RESPONSE:", data);
 
    const reply =
      data?.choices?.[0]?.message?.content ||
      "Hmm, I didn't catch that.";
 
    res.json({ reply });
 
  } catch (err) {
    console.error("ERROR:", err);
    res.json({ reply: "ugh sorry, something went wrong on my end." });
  }
});
 
app.listen(3000, () => console.log("Server running on port 3000"));
 