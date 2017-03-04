"use strict";
module.change_code = 1;
var _ = require("lodash");
var TakeSurveyHelper = require("./survey_helper");
var TAKE_SURVEY_DATA_TABLE_NAME = "SurveyData";
var localUrl = "http://localhost:4000";
var localCredentials = {
    region: "us-east-1",
    accessKeyId: "fake",
    secretAccessKey: "fake"
};
var localDynasty = require("dynasty")(localCredentials, localUrl);
var dynasty = localDynasty;

function DatabaseHelper() {
}
var surveyTable = function() {
    return dynasty.table(TAKE_SURVEY_DATA_TABLE_NAME);
};

DatabaseHelper.prototype.createSurveyTable = function() {
    return dynasty.describe(TAKE_SURVEY_DATA_TABLE_NAME)
        .catch(function(error) {
            console.log("createSurveyTable::error: ", error);
            return dynasty.create(TAKE_SURVEY_DATA_TABLE_NAME, {
                key_schema: {
                    hash: ["userId", "string"]
                }
            });
        });
};

DatabaseHelper.prototype.storeSurveyData = function(userId, surveyData) {
    console.log("writing survey data to database for user " + userId);
    return surveyTable().insert({
        userId: userId,
        data: JSON.stringify(surveyData)
    }).catch(function(error) {
        console.log(error);
    });
};

DatabaseHelper.prototype.readSurveyData = function(userId) {
    console.log("reading survey data with user id of : " + userId);
    return surveyTable().find(userId)
        .then(function(result) {
            var data = (result === undefined ? {} : JSON.parse(result["data"]));
            return new TakeSurveyHelper(data);
        }).catch(function(error) {
            console.log(error);
        });
};

module.exports = DatabaseHelper;
