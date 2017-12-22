var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer')
// var gm = require('gm').subClass({imageMagick: true});

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


    // --------------------facedetect function--------------------------------------------
    var params_face = {
        images_file: fs.createReadStream('./client/uploads/image.jpg'),
    };

    visual_recognition.detectFaces(params_face,
        function(error_detect, response) {
            if (error_detect){
                console.log(error_detect);
                res.send("Personne")
            }
            else{
                //TODO: if judgement
                faceArray= response["images"][0]["faces"]
                if(faceArray.length){
                    //if several persons present, chose the first one in the face array
                    faceLocation =faceArray[0]["face_location"]
                    
                    var srcPath = __dirname + '/client/uploads/image.jpg'
                    var dstPath = __dirname + '/client/uploads/imageresized.jpg'
                    var x=faceLocation["left"] // topright location : left 2 right
                    var y=faceLocation["top"]  // topright location : top 2 bottom
                    var height=faceLocation["height"] // crop size height
                    var width =faceLocation["width"] // crop size width
                    var args = [
                        srcPath,
                        "-crop",
                        width+"x"+height+"+"+x+"+"+y,
                        dstPath
                    ];
                    im.convert(args, function(error_crop) {
                        if(error_crop){
                            console.log(error_crop)
                            res.send("Personne")
                        }else{
                            var params = {
                                 images_file: fs.createReadStream('./client/uploads/imageresized.jpg'),
                                 parameters: {
                                     "classifier_ids":["FaceReader_V2_1730969211"]
                                 }
                            };
                            visual_recognition.classify(params, function(error_classify, IBMresponse) {
                             if (error_classify){
                                 console.log(error_classify);
                                 res.send("Personne");
                             }
                             else{
                                 console.log(JSON.stringify(IBMresponse, null, 2));
                                 var result = IBMresponse["images"][0]["classifiers"];
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
                        }
                    });
                }else{
                    res.send("Personne")
                }
            }
        });

//-----------------------Crop function--------------------------------------------
    // var srcPath = __dirname + '/client/uploads/image.jpg'
    //     var dstPath = __dirname + '/client/uploads/imageresized.jpg'
    //     var x=50 // left 2 right
    //     var y=0  // top 2 botten
    //     var args = [
    //         srcPath,
    //         "-crop",
    //         "120x80+"+x+"+"+y,
    //         dstPath
    //     ];
    //     im.convert(args, function(err) {
    //         if(err){
    //             console.log(err)
    //         }else{
    //             res.sendFile(dstPath);
    //         }
    //     });

// ----------------------Origin Version-------------------------------------------
    // var params = {
    //      images_file: fs.createReadStream('./client/uploads/image.jpg'),
    //      parameters: {
    //          "classifier_ids":["FaceReader_V2_1730969211"]
    //      }
    // };
    // visual_recognition.classify(params, function(err, response) {
    //  if (err){
    //      console.log(error);
    //  }
    //  else{
    //      console.log(JSON.stringify(response, null, 2));
    //      var result = response["images"][0]["classifiers"]
    //      if (result.length>0)
    //      {
    //          var resultname = result[0]["classes"][0]["class"]
    //      }
    //      else{
    //          var resultname = "Personne"
    //      }
    //      res.send(resultname);
    //  }
    // });

    
});

app.listen(port, function () {
  console.log('App listening on port 4242!');
});
