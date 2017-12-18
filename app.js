var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer')
app.use(express.static('client'));

// Multer storage options
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'client/uploads');
  },
  filename: function(req, file, cb) {
    cb(null, 'image' + '.jpg');
  }
});

var watson = require('watson-developer-cloud');
	var visual_recognition = watson.visual_recognition({
	  api_key: '45ac944541bb307b8591284c90aa39aa18d7dfa5',
	  version: 'v3',
	  version_date: '2016-05-20'
	});


var upload = multer({ storage: storage });

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/client/" + "index.html" );
});

app.post('/upload', upload.single('image'), function(req, res, next){


	var params = {
  		images_file: fs.createReadStream('./client/uploads/image.jpg'),
  		parameters: {
  			"classifier_ids":["FacerReader_878661806"]
  		}
	};
	visual_recognition.classify(params, function(err, response) {
		if (err){
		    console.log(error);
		}
		else{
		    console.log(JSON.stringify(response, null, 2));
			var result = response["images"][0]["classifiers"][0]["classes"][0]["class"]
			res.send(result);
		}
	});

    
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
