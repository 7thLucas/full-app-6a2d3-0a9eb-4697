// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";
import scoreRoutes from "~/game/routes/scores.routes";

// Initialize models
await initializeModels();

// Register game score routes
routes.use(scoreRoutes);

export default routes;
