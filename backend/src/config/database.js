import { DataSource } from "typeorm";
import "dotenv/config";
import UserSchema from "../models/UserSchema.js";
import AnalysisSchema from "../models/AnalysisSchema.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "cine_truth-integrador",
  synchronize: false,
  logging: false,
  entities: [UserSchema, AnalysisSchema],
});

export default AppDataSource;
