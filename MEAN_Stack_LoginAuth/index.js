const express = require('express')
const app = express()

const mongoose = require('mongoose');
const config = require('./config/databse');

const path = require('path');

const router = express.Router();
const auth = require('./routes/auth')(router);

const bodyParser = require('body-parser');

const cors = require('cors'); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.



mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) => {
	if(err){
		console.log('Could NOT connect to  database:', err);
	}else{
		console.log('Connected to database:' + config.db);
	}
});


app.use(cors({ origin: 'http://localhost:4200' }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/client/dist/'));
app.use('/auth', auth);


app.get('/',   (req, res)  => {
  // res.send('Hello World!');
  res.sendFile(path.join(__dirname + '/client/dist/index.html'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})