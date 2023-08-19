const fs = require("fs");
const path = require("path");
const https = require("https");
const colors = require("colors");
const crypto = require("crypto");
const multer = require("multer");
const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const sessions = require("./middleware/sessions");
// const GridFsStorage = require("multer-gridfs-storage");
const { errorHandler } = require("./middleware/errormiddleware");
const cors = require("cors");
const corsOption = require("./config/corsOption")
const credentials = require("./middleware/credentials")




// const helmet = require("./middleware/helmet");
const app = express();
//port  number
const port = process.env.port || 3040;

const morgan = require("morgan");
const logger = require("./utils/logger");
// const employeelogger = require("./utils/employeelogger");

//logger
app.use(morgan("tiny", { stream: logger.stream }));
// app.use(morgan('tiny', { stream: stafflogger.stream }));

connectDB();

//credentials 
app.use(credentials)

//CORS
app.use(cors(corsOption));

//... mz
//middlewares
// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }
app.use(sessions);

app.use(express.json());
//TODO:sessions
app.use(express.urlencoded({ extended: false }));
// app.use(methodOverride("_method"));

app.use("/users", require("./router/users/users"));
// app.use("/shops", require("./routes/shops"));
// app.use("/menu", require("./routes/menu"));
// app.use("/branch", require("./routes/branch"));
// app.use("/role", require("./routes/roles"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
  logger.info(`server running on development`);
});
