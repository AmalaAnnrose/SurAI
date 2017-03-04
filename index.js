"use strict";
module.change_code = 1;
var _ = require("lodash");
var Skill = require("alexa-app");
var skillService = new Skill.app("takeSurveyBuilder");
var TakeSurveyHelper = require("./survey_helper");
var TAKE_SURVEY_SESSION_KEY = "survey_builder";
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

skillService.intent("takeSurveyIntent", {
    "slots" : {
        "STEPVALUE" : "STEPVALUES"
    },
    "utterances" : ["{take|start|begin} {|a|the} survey", "{-|STEPVALUE}"]
},
    function (request, response) {
        var stepValue = request.slot("STEPVALUE");
        var takeSurveyHelper = getTakeSurveyHelper(request);
        takeSurveyHelper.started = true;
        if (stepValue !== undefined) {
            takeSurveyHelper.getStep().value = stepValue;
        }
        if (takeSurveyHelper.completed()) {
            //****TODO****
            response.say("The survey is complete!");
        } else {
            if (stepValue !== undefined) {
                takeSurveyHelper.currentStep++;
            }
            response.say(takeSurveyHelper.getPrompt());
            response.reprompt("I didn't hear anything." + takeSurveyHelper.getPrompt());
            response.shouldEndSession(false);
        }
        response.session(TAKE_SURVEY_SESSION_KEY, takeSurveyHelper);
    });
    module.exports = skillService;
