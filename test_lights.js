var http = require('http');
var hue = require("node-hue-api");
var _ = require('underscore');
var sleep = require('sleep');
var displayError = function (err) {
    console.log(err);
};
var lights;
var HueApi = require("node-hue-api").HueApi;



var hostname = "192.168.1.2",
    userDescription = "nodeJS";
username = '9d1ecc82fe609ff3802ba78f921def';

var storeLights = function (result) {
    lights = result.lights;
    console.log("lights stored: " + lights.length);
    // console.log(lights);
}





var flash = function () {
    console.log("testing lights");

    _.each(lights, function (light) {

        api.setLightState(light.id, { "on": true }) // provide a value of false to turn off

            .fail(displayError)
            .done();

    });

    _.each(lights, function (light) {
        api.setLightState(light.id, { "on": false }) // provide a value of false to turn off

            .fail(displayError)
            .done();
    });
}
api = new HueApi(hostname, username);
api.lights()
    .then(storeLights)

    .then(function () {
        var x = 0;
        var intervalID = setInterval(function () {

            flash();
            if (++x === 5) {
               clearInterval(intervalID);
            }
        }, 1000);
    } ()
    )

    .done();

