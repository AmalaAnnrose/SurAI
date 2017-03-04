"use strict";
module.change_code = 1;
var _ = require("lodash");
var Skill = require("alexa-app");
var skillService = new Skill.app("takeSurveyBuilder");
var TakeSurveyHelper = require("./survey_helper");
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();
var TAKE_SURVEY_SESSION_KEY = "survey_builder";
skillService.pre = function(request, response, type) {
    databaseHelper.createSurveyTable();
};
var getTakeSurveyHelper = function(request) {
    var takeSurveyHelperData = request.session(TAKE_SURVEY_SESSION_KEY);
    if (takeSurveyHelperData == undefined) {
        takeSurveyHelperData = {};
    }
    return new TakeSurveyHelper(takeSurveyHelperData);
};
var cancelIntentFunction = function(request, response) {
    response.say("GoodBye!").shouldEndSession(true);
};

skillService.intent("AMAZON.CancelIntent", {}, cancelIntentFunction);
skillService.intent("AMAZON.StopIntent", {}, cancelIntentFunction);
var getTakeSurveyHelperFromRequest = function(request) {
    var takeSurveyHelperData = request.session(TAKE_SURVEY_SESSION_KEY);
    return getTakeSurveyHelper(takeSurveyHelperData);
};
var takeSurveyIntentFunction = function (takeSurveyHelper, request, response) {
    var stepValue = request.slot('STEPVALUE');
    takeSurveyHelper.started = true;
    if (stepValue !== undefined) {
        takeSurveyHelper.getStep().value = stepValue;
    }
    if (takeSurveyHelper.completed()) {
        var completedSurvey = takeSurveyHelper.buildSurvey();
        response.say("The survey is complete");
        //****TODO****
        response.shouldEndSession(true);
    } else {
        if (stepValue !== undefined) {
            takeSurveyHelper.currentStep++;
        }
        resonse.say(takeSurveyHelper.getPrompt());
        response.repromt('I did not hear anything. ' + takeSurveyHelper.getPrompt());
        response.shouldEndSession(false);
    }
    response.session(TAKE_SURVEY_SESSION_KEY, takeSurveyHelper);
    response.send();
};

skillService.launch(function(request, response) {
    var prompt = "Welcome to TakeSurvey. To take a survey, say take survey";
    response.say(prompt).shouldEndSession(false);
});

skillService.intent("AMAZON.HelpIntent", {},
    function(request, response) {
        var takeSurveyHelper = getTakeSurveyHelper(request);
        var help = "Welcome to TakeSurvey. To take a survey, say take survey. "
            + "You can also say stop or cancel to exit.";
        if (takeSurveyHelper.started) {
            help = takeSurveyHelper.getStep().help;
        }
        response.say(help).shouldEndSession(false);
    });

skillService.intent('loadTakeSurveyIntent', {
    'utterances': ['{load|resume} {|a|the} {|last} survey']
},
    function(request, response) {
        var userId = request.userId;
        databaseHelper.readSurveyData(userId).then(function(loadedTakeSurveyHelper) {
            return takeSurveyIntentFunction(loadedTakeSurveyHelper, request, response);
        });
        return false;
    });

skillService.intent("takeSurveyIntent", {
    "slots" : {
        "STEPVALUE" : "STEPVALUES"
    },
    "utterances" : ["{take|start|begin} {|a|the} survey", "{-|STEPVALUE}"]
    },
    function (request, response) {
        takeSurveyIntentFunction(getTakeSurveyHelperFromRequest(request), request, response);
    });

skillService.intent('saveTakeSurveyIntent', {
    'utterances': ['{save} {|a|the|my} survey']
    },
    function(request, response) {
        var userId = request.userId;
        var takeSurveyHelper = getTakeSurveyHelperFromRequest(request);
        databaseHelper.storeSurveyData(userId, takeSurveyHelper).then(
            function(result) {
                return result;
            }).catch(function(error) {});
        response.say('Your survey has been saved.');
        response.shouldEndSession(true).send();
        return false;
    });

    module.exports = skillService;
