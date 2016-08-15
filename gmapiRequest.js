var httpRequest = require('request');
function gmapiRequest(id,url,response,postBody,returnHandler){
    //preparing the API request
    var jsonBody = {"id":id,"responseType":"JSON"};
    var postBodyKey = Object.keys(postBody)
    if (postBodyKey.length != 0){
        for (i = 0 ; i<postBodyKey.length; i++){
            jsonBody[postBodyKey[i]] = postBody[postBodyKey[i]];
        }
    }
    var formData = {
        url: "http://gmapi.azurewebsites.net/"+url,
        headers: {"Content-Type":"application/json"}, 
        json: jsonBody,
        method: "POST",
    }
    //This block fires the request to GM. Then, it uses the callback funtion to update the status to the client
    httpRequest(formData,function(error,res,body){ 
        if (!error){
            var returnBody = {};// initialize a dictionary to store all the datas that we are interesting in.
            returnHandler(returnBody,body);//returnHandler

        }
        else{
            response.writeHeader(400);
            response.send(error);
        }
    });
}

module.exports = {
    gmapi: gmapiRequest
}