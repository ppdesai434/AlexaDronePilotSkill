
var AWS = require('aws-sdk');
var iotdata = new AWS.IotData({endpoint: 'ayak4zdc6j1qk.iot.us-east-1.amazonaws.com'});

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        
        if (event.session.application.applicationId !== "amzn1.ask.skill.ec6e4aa8-507f-435e-8f65-ce943161607a") {
             context.fail("Invalid Application ID");
        }
        

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);
console.log("session details:"+JSON.stringify(session));
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
        var theFlagToEnterLoop = 0;
        
        
     if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback,session);
    }else if ("EmotionalIntent" === intentName) {
        getEmotionalResponse(callback,session);
    }else if ("AMAZON.StopIntent" === intentName) {
        endSession(callback);
    } 
        
        
        if(session.attributes){
            console.log("in session att");
            if(session.attributes.istakeoff===false && intent.slots.Command.value=='take off'){
                // Dispatch to your skill's intent handlers
                console.log("in our true");
    theFlagToEnterLoop = 1 ;
    session.attributes.istakeoff=true;
            }
            else if(session.attributes.istakeoff===true){
                console.log("in our false");
    theFlagToEnterLoop = 1 ;            
            }
        }


if(theFlagToEnterLoop==1){
    if ("CommandIntent" === intentName) {
        sendCommand(intent, session, callback);
    } 
    else {
        throw "Invalid intent";
    }
}
else{
     getTakeoffResponse(callback,session);
}



    
  //if((sessionAttributes.firstrun===1 && intent.slots.Command.value=='take off')&&(sessionAttributes.firstrun===0)){
    // Dispatch to your skill's intent handlers
      
  
    
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {"istakeoff":false,"cusscount":0};
    var cardTitle = "Welcome";
    var speechOutput = "Howdy! This is your captain hawk. I can navigate the drone for you. Just fire the commands and I'll take care of the rest! Are you ready? Say your first command.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please say a command";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getHelpResponse(callback,session) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = session.attributes;
    var cardTitle = "Help";
    var speechOutput = "You can say a command to pilot the drone starting with take off, and then use: up, down, right, left, forward and backward to navigate. Additionally you can say, flip, take a picture, shoot,and grab, for advanced features. You can land the drone by saying land. Now try a command !";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please say a command";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getTakeoffResponse(callback,session) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = session.attributes;
    var cardTitle = "Take off";
    var speechOutput = "Why don't we take off first? Please say take off";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please say a command";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}



function getEmotionalResponse(callback,session) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = session.attributes;
    var cardTitle = "Sorry";
    var speechOutput = "I'm Sorry";
    
    
    if(parseInt(session.attributes.cusscount)===0){
        speechOutput="Having a Bad Day ? Let me cheer you up ! Just say a command !";
        session.attributes.cusscount=1;
    }
    else if(parseInt(session.attributes.cusscount)===1){
        speechOutput="Dear oh dear, you seem upset. What do you want me to do?";
        session.attributes.cusscount=2;
    }
    else if(parseInt(session.attributes.cusscount)>=2){
        speechOutput="I'm so sorry that you're, unhappy. Shall we try this again? Please say a command !!!";
        session.attributes.cusscount=3;
    }
    
    
    
    
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please say a command";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


/**
 * Sends a command
 */
function sendCommand(intent, session, callback) {
    var repromptText = null;
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var command = intent.slots.Command;
    
    console.log("Received command", command);
    console.log("intent content",intent);
    console.log("My comparison",command.value=="cheese");
    
    if(command.value=="cheese"){
    console.log("In here first");
        droneApi("forward", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("forward", "Command Received", repromptText, shouldEndSession));
        });
    console.log("In here second");    
        droneApi("turn right", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("turn right", "Command Received", repromptText, shouldEndSession));
        });
    console.log("In here third");    
        
        droneApi("forward", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("forward", "Command Received", repromptText, shouldEndSession));
        });
        
        droneApi("turn right", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("turn right", "Command Received", repromptText, shouldEndSession));
        });
        
        droneApi("forward", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("forward", "Command Received", repromptText, shouldEndSession));
        });
        
        droneApi("turn right", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("turn right", "Command Received", repromptText, shouldEndSession));
        });
        
        droneApi("forward", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("forward", "Command Received", repromptText, shouldEndSession));
        });
        
        droneApi("turn right", function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse("turn right", "Command Received", repromptText, shouldEndSession));
        });
        
        
    }
    else if (command) {
        droneApi(command.value, function(speechOutput){
            callback(sessionAttributes,
                buildSpeechletResponse(intent.slots.Command.value, "Command Received", repromptText, shouldEndSession));
        });
    }
    else {
        repromptText = "Unknown command. Just say a command like: take off, up or down";
        var speechOutput = repromptText;
        callback(sessionAttributes,
            buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
    }
}


function droneApi(command, callback) {
    console.log("Calling IOTData ...");
    
    var params = {
        topic: '$aws/things/Mambo/shadow/update', // required
        payload: '{ "state": {"desired": { "command" :"'+ command + '"}}}',qos: 0
    };

    iotdata.publish(params, function(err, data) {
        if (err) {   // an error occurred
            console.log(err, err.stack);
            callback("Error when sending command to drone");
        }
        else {  // successful response
            console.log(data);
            callback(""); //Executed " + command);
        }    
    });

}

function endSession(callback) {
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var cardTitle = null;
    var speechOutput = "Goodbye";
    var date = new Date();
    var current_hour = date.getHours();
    if(current_hour>=0 && current_hour<=12 ){
        speechOutput="Bye, have a wonderful Day !";
    }else if(current_hour>=13 && current_hour<=16 ){
        speechOutput="Take care, have a Good Afternoon !";
    }else {
        speechOutput="Enjoy your Evening, Bye!";
    }
    
    
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "Project Topgun - " + title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}