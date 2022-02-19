const express = require('express')
const mongoose = require('mongoose')
var bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()

// Database setup

const Exercise = {
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: String, required:true}
}


// Configure the connection to the database

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema= mongoose.Schema({
  username: {type: String, required: true},
  count: {type: Number},
  log: [Exercise]
})

const userModel = mongoose.model('user', userSchema);

// Basic functions

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
  var str=req.method + ' ' + req.path + ' - ' + req.ip;
  console.log(str+'\n');
  next();
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Main 

app.post('/api/users',function(req,res,next) {
  console.log('Trying to create a new user...\n');
  let it = new userModel({username: req.body.username, count:0});
  it.save((err)=>{
      if(err || typeof(req.body.username)!='string'){res.send("Wrong user name"); next(); return console.error(err);}
      console.log('New user saved !\n');
      res.json({_id: it._id, username: it.username});
      next();
  })
})

app.get('/api/users',function(req, res, next){
  userModel.find({}).select(['username']).exec((err, arr)=>{
      if(err){res.send('An error occured.');  next(); return console.error(err);}
      console.log('Showing all the users\n');
      res.send(arr);
      next();
  })
})

app.post('/api/users/:id/exercises',function(req,res,next){
  userModel.findById(req.params.id,(err, obj)=>{
      if(err || !obj) {res.send("Can't find this user."); next(); return console.error(err);}
      let exercise={
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date=='' ? new Date().toDateString(): new Date(req.body.date).toDateString()
      };
      obj.log.push(exercise);
      obj.count = obj.count+1;
      obj.save((err)=>{
          if(err) {res.send('An error occured. Please make sure that you filled the form with the right values.'); next(); return console.error(err);}
          console.log('Exercise added to user: '+obj.username+'\n'+`Exercise count: ${obj+1}`);
          res.json({_id: req.params.id,username: obj.username, description: exercise.description, duration: exercise.duration, date: exercise.date});
          next();
      })
  })
})

app.get('/api/users/:id/logs',function(req,res,next){
  userModel.findById(req.params.id, function(err,user){
    if(err || !user){res.send("Can't find this user."); next(); console.error(err);}
    else{
          res.json(data);
    }
    next();
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
