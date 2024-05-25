const express = require('express');
const dotenv = require('dotenv').config();

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
    }
);
