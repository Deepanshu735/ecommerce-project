import "dotenv/config";
import app from "./src/app.js";

const port = 3500;

app.listen(port, () => {
  console.log(`Modular ecommerce app listening on http://localhost:${port}`);
});
