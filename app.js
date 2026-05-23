require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectDB = require("./config/connect");
const authRouter = require("./routes/auth.route");
const jobsRouter = require("./routes/jobs.route");
const { authMiddleware } = require("./middleware/auth.middleware");
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();

app.use(express.json());

// extra packages
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(cors());
app.use(helmet());
app.use(xss());

// routes
app.get("/", (req, res) => {
  res.send(
    "<h1>Welcome to the Jobs API</h1> <a href='/api-docs'>Read API Documentation</a>",
  );
});
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authMiddleware, jobsRouter);

// error handler middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
