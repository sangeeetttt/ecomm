// packages
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import fs from 'fs';
import https from 'https';
import path from "path";
// Utils
import connectDB from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`;
  console.log(logEntry);
  fs.appendFile('audit.log', logEntry + '\n', (err) => {
    if (err) {
      console.error('Error writing to audit log:', err);
    }
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

// app.listen(port, () => console.log(`Server running on port: ${port}`));
https.createServer({
  cert: fs.readFileSync('./localhost.crt'),
  key: fs.readFileSync('./localhost.key')
},app ).listen(5000);
