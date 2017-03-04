'use strict';
module.change_code = 1;
var _ require('lodash');

function TakeSurveyHelper(obj) {
    this.started = false;
    this.surveyIndex = 0;
    this.currentStep = 0;
    this.survey = [
        {
            title: 'Survey',
            template: '${response1}\n${response2}\n${response3}\n${response4}\n${response5}\n${response6}\n${response7}',
            steps: [
                {
                    value : null,
                    template_key : 'response1',
                    prompt: 'What did you like the most about Stack Hack?',
                    help: 'Speak the thing you liked the most about Stack Hack.'
                },
                {
                    value : null,
                    template_key : 'response2',
                    prompt: 'Did you dislike anything? If so what?',
                    help: 'Speak something you disliked about Stack Hack, if there was anything. If you did not dislike anything, say nothing'
                },
                {
                    value : null,
                    template_key : 'response3',
                    prompt: 'What would you improve about Stack Hack?',
                    help: 'Speak something you would improve about Stack Hack, if there was anything. If there was nothing you would improve, say nothing'
                },
                {
                    value : null,
                    template_key : 'response4',
                    prompt: 'Did you like the food?',
                    help: 'Speak if you liked the food at Stack Hack. If there was no food you liked, say nothing'
                },
                {
                    value : null,
                    template_key : 'response5',
                    prompt: 'Did you like the goody pack?',
                    help: 'Speak if you liked the goody pack at Stack Hack. If you did not like the goody pack, say nothing'
                },
                {
                    value : null,
                    template_key : 'response6',
                    prompt: 'Was there enough space?',
                    help: 'Speak if there was enough space at Stack Hack. If there was not enough space, say no'
                },
                {
                    value : null,
                    template_key : 'response7',
                    prompt: 'Would you recommend Stack Hack to your friends?',
                    help: 'Speak if you would recommend Stack Hack to your friends. If not, say no'
                }
            ]
        }
    ];
    for (var prop in obj) this[prop] = obj[prop];
}

TakeSurveyHelper.prototype.completed = function() {
    return this.currentStep === (this.currentSurvey().steps.length - 1);
};

TakeSurveyHelper.prototype.getPrompt = function() {
    return this.getStep().prompt;
};

TakeSurveyHelper.prototype.getStep = function() {
    return this.currentSurvey().steps[this.currentStep];
};

TakeSurveyHelper.prototype.buildSurvey = function() {
    var currentSurvey = this.currentSurvey();
    var templateValues = _.reduce(currentSurvey.steps, function(accumulator, step) {
        accumulator[step.template_key] = step.value;
        return accumulator;
    }, {});
    var compiledTemplate = _.template(currentSurvey.template);
    return compiledTemplate(templateValues);
};

TakeSurveyHelper.prototype.currentSurvey = function() {
    return this.survey[this.surveyIndex];
};

module.exports = TakeSurveyHelper;
