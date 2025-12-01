import express from "express";
import cors from "cors";
import morgan from "morgan";
import { subdomainMiddleware } from "./middleware/subdomain";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Apply subdomain middleware globally
app.use(subdomainMiddleware);

// API Routes
app.use("/api", routes);

export default app;
