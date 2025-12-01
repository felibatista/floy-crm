import app from "./app";
import { validateConnection } from "./lib/prisma";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  validateConnection();
  console.log(`Server running on port ${PORT}`);
});
