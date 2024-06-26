const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const multer = require("multer");
const csv = require("csv-parser");

const Trade = require("./models/trade");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.post("/upload", upload.single("file"), (req, res) => {
  const results = [];
  // console.log(req.file);

  if (!req.file) {
    return res.status(400).json({
      message: "Invalid request. Ensure file is uploaded",
    });
  }
  if (req.file.mimetype !== "text/csv") {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      message: "Invalid file format. Ensure file is a CSV file",
    });
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      if (
        !data.UTC_Time ||
        !data.Operation ||
        !data.Market ||
        !data["Buy/Sell Amount"] ||
        !data.Price
      ) {
        return res.status(400).json({
          message: "Invalid data format. Ensure all fields are present",
        });
      }

      const [base_coin, quote_coin] = data.Market.split("/");
      const trade = new Trade({
        utc_time: new Date(data.UTC_Time),
        operation: data.Operation,
        base_coin: base_coin,
        quote_coin: quote_coin,
        amount: parseFloat(data["Buy/Sell Amount"]),
        price: parseFloat(data.Price),
      });
      // console.log(trade);
      results.push(trade);
    })
    .on("end", () => {
      Trade.insertMany(results)
        .then(() =>
          res.status(200).json({
            message: "Data uploaded successfully",
            data: results,
          })
        )
        .catch((err) =>
          res.status(500).json({
            message: "An error occurred",
            error: err,
          })
        );
      fs.unlinkSync(req.file.path);
    });
});

app.post("/balance", (req, res) => {
  const { timestamp } = req.body;
  if (!timestamp) {
    return res.status(400).json({
      message: "Invalid request. Ensure timestamp is provided",
    });
  }
  if (isNaN(new Date(timestamp).getTime())) {
    return res.status(400).json({
      message: "Invalid timestamp. Ensure timestamp is a valid date",
    });
  }
  if (new Date(timestamp) > new Date()) {
    return res.status(400).json({
      message: "Invalid timestamp. Ensure timestamp is not in the future",
    });
  }
  
  const Time = new Date(timestamp);
  Trade.find({ utc_time: { $lt: Time } })
    .then((trades) => {
      const assetBalance = trades.reduce((acc, trade) => {
        const { base_coin, operation, amount } = trade;
        if (!acc[base_coin]) {
          acc[base_coin] = 0;
        }
        acc[base_coin] += operation.toLowerCase() === "buy" ? amount : -amount;
        return acc;
      }, {});

      res.status(200).json(assetBalance);
    })
    .catch((err) => {
      res.status(500).json({
        message: "An error occurred",
        error: err,
      });
    });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Trade API",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`);
});
