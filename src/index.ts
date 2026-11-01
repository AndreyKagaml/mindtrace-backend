import { db } from "./config/database.js";
import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT,()=> {console.log(`server running on port ${PORT}`)});

db.query("SELECT 1").then(()=> console.log("db connected"));
