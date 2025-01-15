const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "GoodGroups API",
    description: "API documentation for the GoodGroups platform.",
  },
  host: "localhost:3000", // Change to your server's host if necessary
  schemes: ["http"], // Change to "https" if needed
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"]; // Main file where all routes are defined

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation has been generated successfully!");
});
