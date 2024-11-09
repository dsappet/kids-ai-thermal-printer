import app from "./src/index";

const server = app.serve();
console.log(`Server running on port ${server.port}`);