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
var httpRequest = require('request');
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//set the server to listen to port 80
const port = 8080;

//the root will reply a WebGUI for simple manual testing purpose
//This section need to be erased when it is no long needed
app.get('/',function(request,response){
    consoleLogActivity(request); // console display request info
    var filePath = path.join(__dirname,'index.html');
    response.sendFile(filePath);
});

//'/vehicles/:id' -> it gets the basic info of the vehicle to the client
app.get('/vehicles/:id',function(request,response){
    consoleLogActivity(request); // console display request info
    var id = request.params.id; //extract the id parameter
    //preparing the API request
    var formData = {
        url: "http://gmapi.azurewebsites.net/getVehicleInfoService",
        headers: {"Content-Type":"application/json"}, 
        json: {"id":id,"responseType":"JSON"},
        method: "POST",
    }
    //This block fires the request to GM. Then, it uses the callback funtion to update the status to the client
    httpRequest(formData,function(error,res,body){ 
        if (!error){
            var returnBody = {};// initialize a dictionary to store all the datas that we are interesting in.
            try{
                var data = body["data"]; //we only care about the data
                returnBody["vin"] = data["vin"]["value"]; //extract the vin 
                returnBody["color"] = data["color"]["value"]; // extract the color
                if (data["fourDoorSedan"]["value"] == "True"){returnBody["doorCount"] = 4;}    
                else {returnBody["doorCount"] = 2;} // we will have a ethier a sedan or a coupe. (should there be one door car?)
                returnBody["driveTrain"] = data["driveTrain"]["value"];//extract engine spec
                response.send(returnBody); //feed the data back to the client
            }catch(err){response.send(body);} // error handler
        }
    });
});

//'/vehicles/:id/doors' -> it gets the door status of a given vehicle ID
app.get('/vehicles/:id/doors',function(request,response){
    consoleLogActivity(request); // console display request info
    var id = request.params.id;//extract the id parameter
    //preparing the API request
    var formData = {
        url: "http://gmapi.azurewebsites.net/getSecurityStatusService",
        headers: {"Content-Type":"application/json"},
        json: {"id":id,"responseType":"JSON"},
        method: "POST",
    }
    //This block fires the request to GM. Then, it uses the callback funtion to update the status to the client
    httpRequest(formData,function(error,res,body){
        if (!error){
            var returnBody =[];// initialize a list to store all the datas that we are interesting in.
            try{
                var data = body["data"]["doors"]["values"];//we only care about the certain values
                for (i = 0; i < data.length; i++){
                    var doorInfo = {};
                    doorInfo["location"] = data[i]["location"]["value"];
                    doorInfo["locked"] = data[i]["locked"]["value"];
                    returnBody.push(doorInfo);
                }// a loop to check every item in data and to append it to our returnBody
                response.send(returnBody);//feed the data back to the client
            }catch(err){response.send(err);}// error handler
        }
    });
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
    var formData = {
        url: "http://gmapi.azurewebsites.net/actionEngineService",
        headers: {"Content-Type":"application/json"},
        json: {"id":id,"responseType":"JSON","command":action},
        method: "POST",
    }
     //This block fires the request to GM. Then, it uses the callback funtion to update the status to the client
    httpRequest(formData,function(error,res,body){
        if(!error){
            try{
                var data = body["actionResult"]["status"];//we only care about the certain values
                if (data == "EXECUTED"){
                    var returnBody = {"status":"success"};
                }
                else{var returnBody = {"status":"error"};}
                response.send(returnBody);//feed the data back to the client
            }catch(err){response.send(err);}//error handler
        }
    });
});

//'/vehicles/:id/:energyType' a get method to retrive the fuel/battery status. 
//This block need to go at the bottom or other API will malfunction because of the :energyType parameter here.
//in the case that this block need to go before other blocks, we need to seperate the fuel/battery into two get method.
//The reason that fuel/battery is combined in this code is to keep the code short and compact.
app.get('/vehicles/:id/:energyType',function(request,response){
    consoleLogActivity(request); // console display request info
    var energyType = request.params.energyType;var id = request.params.id; ////extract the id and energyType
    //preparing the API request
    var formData = {
        url: "http://gmapi.azurewebsites.net/getEnergyService",
        headers: {"Content-Type":"application/json"},
        json: {"id":id,"responseType":"JSON"},
        method: "POST",
    };
    //This block fires the request to GM. Then, it uses the callback funtion to update the status to the client
    httpRequest(formData,function(error,res,body){
        if(!error){
            try{
                var returnBody ={};
                var data = body["data"];//we only care about the certain values
                //validation check and prepare the resturn body
                if (energyType == "battery"){
                    returnBody["battery"] = data["batteryLevel"]["value"];
                }
                else if (energyType == "fuel"){
                    returnBody["fuel"] = data["tankLevel"]["value"];
                }
                else{
                    returnBody["rejected"] = "invalid energy type provided"
                }
                response.send(returnBody);//feed the data back to the client
            }catch(err){response.send(err);}//error handler
        }
    });
});


var server = app.listen(port,function(){
    console.log("Service started on port "+port.toString()+": Chu Lin");//start the service
})

//display the activity to console for debug purpose
function consoleLogActivity(request){
    console.log("IP: "+request.connection.remoteAddress+ " requested "+request.url);
}