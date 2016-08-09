/////////////////////////////////////////////////////////////
//Chu Lin @ pikeittt@gmail.com                             //
//This is the test script for server.js                    //
//Block one is the unit test for '/vehicle/:id/engin'      //
//Block two is the general purpose unite test for all APIs //
//Block three - six is the stress for specific API         //
/////////////////////////////////////////////////////////////


//package requirement
var assert = require('assert');
var request = require('supertest');
var should = require('should');

//const setup 
const ip = "http://127.0.0.1" //server ip
const port = ":8080"          // server listening port
const allUrl = ["","/fuel","/battery","doors"]; //lookup table for randomly generated request
const stressTestLoop = 100;   //stress test loop
const generalTestLoops = 20; //loop for Unit test Suit section

//block 1
//Unit test for engine start/stop API.
//Because running a repeated test on Engine start/stop feature would potentially damage the engine, 
//no loop provided for this test
describe('Unit test Engine start/Stop remote',function(){
    this.timeout(15000);
    it("/vehicle/1234/engine: engine start",function(done){
        request(ip+port).post('/vehicles/1234/engine').send({"action":"START"}).expect(200).end(function(err,res){
            if(err){
                throw err;
            }
            res.body.should.have.property('status');
            done();
        })
    });
    it("/vehicle/1234/engine: engine stop",function(done){
        request(ip+port).post('/vehicles/1234/engine').send({"action":"STOP"}).expect(200).end(function(err,res){
            if(err){
                throw err;
            }
            res.body.should.have.property('status');
            done();
        })
    })
})

//block two
//General unit test suit. 
//it will randomly generate the vehicle id (100,2000) and the url (allUrl = ["","/fuel","/battery","doors"]).
//Then, it will match the real output to the expected output
describe('Unit test Suit',function(){
    this.timeout(15000);
    for (i=0;i<generalTestLoops;i++){
        var randomTest = Math.round(Math.random() * (2000 - 100) + 100);
        var randomURL = randomReturn();
        it("API "+'/vehicles/'+randomTest.toString()+allUrl[randomURL],function(done){
            request(ip+port).get('/vehicles/'+randomTest.toString()+allUrl[randomURL]).end(function(err,res){
                if(err){
                   throw err;
                }
                if (res.body["status"] == 404){
                    res.body.should.have.property('reason');
                }
                else {
                    if (randomURL == 0){
                        res.should.have.property('status',200);
                        res.body.should.have.property('vin');
                        res.body.should.have.property('color');
                        res.body.should.have.property('doorCount');
                        res.body.should.have.property('driveTrain');
                    }
                    else if (randomTest == 1){
                        res.should.have.property('status',200);
                        res.should.have.property('fuel');
                    }
                    else if (randomTest == 2){
                        res.should.have.property('status',200);
                        res.should.have.property('battery');
                    }
                    else{
                        res.should.have.property('status',200);
                    }
                }
                done();
            });
        })
    }
})


//block three
//stress test for single url.
//it will keep firing request to /vehicles/1234 (one we know will surely have a return) and match it to the expected output
describe('Stress Test /vehicles/:id',function(){
    this.timeout(15000);
    for (i=0;i<stressTestLoop;i++){
        it("loop"+i.toString()+"\n/vehicles/:id",function(done){
            request(ip+port).get('/vehicles/1234').end(function(err,res){
                if (err){
                    throw err;
                }
                res.should.have.property('status',200);
                res.body.should.have.property('vin');
                res.body.should.have.property('color');
                res.body.should.have.property('doorCount');
                res.body.should.have.property('driveTrain');
                done();
            });
        });
    }   
});


//block four
//stress test for single url.
//it will keep firing request to /vehicles/1234/doors (one we know will surely have a return) and match it to the expected output
describe('Stress Test /vehicles/:id/doors',function(){
    this.timeout(15000);
    for (i=0;i<stressTestLoop;i++){
        it("loop"+i.toString()+"\n/vehicles/:id/doors",function(done){
            request(ip+port).get('/vehicles/1234/doors').end(function(err,res){
                if (err){
                    throw err;
                }
                res.should.have.property('status',200);
                done();
            });
        });
    }   
});


//block five
//stress test for single url.
//it will keep firing request to /vehicles/1234/fuel (one we know will surely have a return) and match it to the expected output
describe('Stress Test /vehicles/:id/fuel',function(){
    this.timeout(15000);
    for (i=0;i<stressTestLoop;i++){
        it("loop"+i.toString()+"\n/vehicles/:id/fuel",function(done){
            request(ip+port).get('/vehicles/1234/fuel').end(function(err,res){
                if (err){
                    throw err;
                }
                res.should.have.property('status',200);
                res.body.should.have.property('fuel');
                done();
            });
        });
    }   
});


//block six
//stress test for single url.
//it will keep firing request to /vehicles/1234/battery (one we know will surely have a return) and match it to the expected output
describe('Stress Test /vehicles/:id/battery',function(){
    this.timeout(15000);
    for (i=0;i<stressTestLoop;i++){
        it("loop"+i.toString()+"\n/vehicles/:id/battery",function(done){
            request(ip+port).get('/vehicles/1234/battery').end(function(err,res){
                if (err){
                    throw err;
                }
                res.should.have.property('status',200);
                res.body.should.have.property("battery");
                done();
            });
        });
    }   
});


//supportive function to return a random url
function randomReturn(){
    var randomTest = Math.round(Math.random() * (2 - 0) + 0);
    return randomTest;
}
