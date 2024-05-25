const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const multer = require('multer');
const csv = require('csv-parser');

const Trade = require('./models/trade');


const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch(err => console.log(err));


app.post('/upload', upload.single('file'), (req, res) => {
    const results = [];
    // console.log(req.file);
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
        const [base_coin, quote_coin] = data.Market.split('/');
        const trade = new Trade({
          utc_time: new Date(data.UTC_Time),
          operation: data.Operation,
          base_coin: base_coin,
          quote_coin: quote_coin,
          amount: parseFloat(data['Buy/Sell Amount']),
          price: parseFloat(data.Price)
        });
        console.log(trade);
        results.push(trade);
    })
    .on('end', () => {
        Trade.insertMany(results)
        .then(() => res.status(200).json(
          {
            message: 'Data uploaded successfully',
            data: results
          }
        ))
        .catch(err => res.status(500).json(
          {
            message: 'An error occurred',
            error: err
          })
        );
        fs.unlinkSync(req.file.path);
    });
});





app.get('/', (req, res) => {
    res.json(
      {
        message: 'Welcome to the Trade API'
      }
    );
});


app.listen(process.env.PORT, () => {
    console.log(`Server listening at http://localhost:${process.env.PORT}`);
    }
);
