const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/authRouter");
const rideRouter = require('./routes/rideRouter');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;  

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/api/rides", rideRouter);

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({message});
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});