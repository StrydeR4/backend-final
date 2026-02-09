require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

console.log("SERVER FILE:", __filename);
console.log("CWD:", process.cwd());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB error:", err.message));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));

