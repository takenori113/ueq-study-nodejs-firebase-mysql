const express = require('express');
const logger = require('morgan');
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});