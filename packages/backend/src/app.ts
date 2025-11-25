import express from "express";
import cors from "cors"; // Added import
import { subdomainMiddleware } from "./middleware/subdomain";
import routes from "./routes";

const app = express();

app.use(cors()); // Added cors middleware
app.use(express.json());

// Apply subdomain middleware globally
app.use(subdomainMiddleware);

// API Routes
app.use("/api", routes);

export default app;
