var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer')
app.use(express.static('client'));
var process = require("process");
var im = require("imagemagick"); 

const port          = process.env.PORT || 4242;

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
    // try{
    //     im.crop({
    //           srcPath: 'test.jpg',
    //           dstPath: 'testout.jpg',
    //           width: 800,
    //           height: 600,
    //           quality: 1,
    //           gravity: "North"
    //     }, function(err, stdout, stderr){
    //       // foo
    //     });
    // }catch(err){
    //     consolo.log(err)
    // }

    // -------------------------------------------------------------
    // var params = {
    //   images_file: fs.createReadStream('./client/uploads/image.jpg')
    // };

    // visual_recognition.detectFaces(params,
    //   function(err, response) {
    //     if (err)
    //       console.log(err);
    //     else
    //       console.log(JSON.stringify(response, null, 2));

    //   });



// -------------------------------------------------------------------------
    var params = {
         images_file: fs.createReadStream('./client/uploads/image.jpg'),
         parameters: {
             "classifier_ids":["FaceReader_V2_1730969211"]
         }
    };
    visual_recognition.classify(params, function(err, response) {
     if (err){
         console.log(error);
     }
     else{
         console.log(JSON.stringify(response, null, 2));
         var result = response["images"][0]["classifiers"]
         if (result.length>0)
         {
             var resultname = result[0]["classes"][0]["class"]
         }
         else{
             var resultname = "Personne"
         }
         res.send(resultname);
     }
    });

    
});

app.listen(port, function () {
  console.log('App listening on port 4242!');
});
