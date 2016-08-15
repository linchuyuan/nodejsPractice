////////////////////////////////////////////////////////
//Chu Lin @ pikeittt@gmail.com                        //
//This server handles 5 APIs' calls                   //
//GET '/vehicle/:id' return general info              //
//GET '/vehicle/:id/door' return door security status //
//POST '/vehicle/:id/engine' remote engine start/stop //
//GET '/vehicle/:id/battery' get battery status       //
//GET '/vehicle/:id/fuel' get fuel tank status        //
////////////////////////////////////////////////////////

//package requirement and preparetion
var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var gmapiRequest = require('./gmapiRequest').gmapi;
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//set the server to listen to port 80
const port = 80;
//Handle uncaught exception
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

//the root will reply a WebGUI for simple manual testing purpose
app.get('/',function(request,response){consoleLogActivity(request); var filePath = path.join(__dirname,'index.html');response.sendFile(filePath);});// console display request info

//'/vehicles/:id' -> it gets the basic info of the vehicle to the client
app.get('/vehicles/:id',function(request,response){
    consoleLogActivity(request); // console display request info
    var id = request.params.id; //extract the id parameter
    gmapiRequest(id,'getVehicleInfoService',response,{},function(returnBody,body){
        var data = body["data"]; //we only care about the data
        returnBody["vin"] = data["vin"]["value"];returnBody["color"] = data["color"]["value"]; //extract the vin // extract the color
        if (data["fourDoorSedan"]["value"] == "True"){returnBody["doorCount"] = 4;}    
        else {returnBody["doorCount"] = 2;} // we will have a ethier a sedan or a coupe. (should there be one door car?)
        returnBody["driveTrain"] = data["driveTrain"]["value"];//extract engine spec
        response.send(returnBody); //feed the data back to the client
    });
});
//'/vehicles/:id/doors' -> it gets the door status of a given vehicle ID
app.get('/vehicles/:id/doors',function(request,response){
    consoleLogActivity(request); // console display request info
    var id = request.params.id;//extract the id parameter
    //preparing the API request
    gmapiRequest(id,'getSecurityStatusService',response,{},function(returnBody,body){
        var returnBody = [];var data = body["data"]["doors"]["values"];//we only care about the certain values
        for (i = 0; i < data.length; i++){
            var doorInfo = {};
            doorInfo["location"] = data[i]["location"]["value"];
            doorInfo["locked"] = data[i]["locked"]["value"];
            returnBody.push(doorInfo);
        }
        response.send(returnBody);//feed the data back to the client
    })
});
//'/vehicles/:id/engine' -> a post method to start or stop the engine. 
app.post('/vehicles/:id/engine',function(request,response){
    consoleLogActivity(request); // console display request info
    var id = request.params.id;var action = request.body.action; //extract the id and action
    //validation check 
    if (action == "START"){action = "START_VEHICLE";}
    else if (action == "STOP"){action = "STOP_VEHICLE";}
    else { response.send('{"rejected":"Invalid input"}');return;}
    //preparing the API request
    gmapiRequest(id,'actionEngineService',response,{"command":action},function(returnBody,body){
        var data = body["actionResult"]["status"];//we only care about the certain values
        if (data == "EXECUTED"){
            var returnBody = {"status":"success"};
        }else{var returnBody = {"status":"error"};}
        response.send(returnBody);//feed the data back to the client
    })
});
//'/vehicles/:id/:energyType' a get method to retrive the fuel/battery status. 
//This block need to go at the bottom or other API will malfunction because of the :energyType parameter here.
//in the case that this block need to go before other blocks, we need to seperate the fuel/battery into two get method.
app.get('/vehicles/:id/:energyType',function(request,response){
    consoleLogActivity(request); // console display request info
    var energyType = request.params.energyType;var id = request.params.id; ////extract the id and energyType
    //preparing the API request
    gmapiRequest(id,'getEnergyService',response,{},function(returnBody,body){
        var returnBody ={};var data = body["data"];//we only care about the certain values
        //validation check and prepare the resturn body
        if (energyType == "battery"){
            returnBody["battery"] = data["batteryLevel"]["value"];
        }else if (energyType == "fuel"){
            returnBody["fuel"] = data["tankLevel"]["value"];
        }else{
            returnBody["rejected"] = "invalid energy type provided"
        }
        response.send(returnBody);//feed the data back to the client
    })
});
var server = app.listen(port,function(){console.log("Service started on port "+port.toString()+": Chu Lin");})//start the service
//display the activity to console for debug purpose
function consoleLogActivity(request){console.log("IP: "+request.connection.remoteAddress+ " requested "+request.url);}