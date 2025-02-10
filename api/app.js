require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const md5 = require("md5");
const cors = require("cors");
const path = require("path");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Route: Authentication
app.post("/auth", async (req, res) => {
  const { userID, password } = req.body;

  const password_hash = md5(password);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("userid", userID)
      .eq("password_hash", password_hash);

    if (error) throw error;

    if (data && data.length > 0) {
      const user = data[0];
      res.json({ role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Route: Fetch Data
app.get("/data", async (req, res) => {
  const { userID, role } = req.query;

  try {
    if (role === "admin") {
      const { data, error } = await supabase.from("users").select();
      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("userid", userID);
      if (error) throw error;
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fallback route for serving the index.html file
app.get("*", (req, res) => {
  // If the request is for an API or static file, let the above middleware handle it
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    res.status(404).send("Not found");
  } else {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
