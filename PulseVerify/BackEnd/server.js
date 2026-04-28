import app from "./app.js";
import connectDB from "./config/db.js";
import { seedIfEmpty } from "./scripts/seedHelper.js";
const PORT = process.env.PORT || 10000;
const start = async () => {
  const conn = await connectDB();
  
  // Auto-seed if DB is connected but empty
  if (conn) {
    await seedIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`🚀 PulseVerify API running on port ${PORT}`);
  });
};

start();