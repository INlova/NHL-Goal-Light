var http = require('http');
var hue = require("node-hue-api");
var _ = require('underscore');
var sleep = require('sleep');
const interval = 2000;
var api_url = 'http://statsapi.web.nhl.com';
var games = [];
var lights;
var HueApi = require("node-hue-api").HueApi;
var PythonShell = require('python-shell');

var lightState = HueApi.lightState;

var hostname = "192.168.1.2",
    userDescription = "nodeJS",
    username = '9d1ecc82fe609ff3802ba78f921def';

var displayError = function (err) {
    console.log(err);
};
var displayResult = function (result) {
    console.log(JSON.stringify(result, null, 2));
};
var storeLights = function (result) {
    lights = result.lights;
}
var GetBoxScore = function (feed, success) {
    //  console.log("getting box score for feed: " + feed);
    http.get(api_url + '/api/v1/game/' + feed + '/feed/live', function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
            // console.log("received chunk: " + chunk);
        });

        response.on('end', function () {
            // console.log("response end");
            var json = JSON.parse(body);

            if (success) {
                // console.log("updated box score at : " + json.metaData.timeStamp)
                success(json.liveData.boxscore);
            }
        });

    });

}
var flashAllLights = function () { 
    //all on
    _.each(lights, function (light) {
        api.setLightState(light.id, { "on": true }) // provide a value of false to turn off
            .fail(displayError)
            .done();
    });
    //all off
    _.each(lights, function (light) {
        api.setLightState(light.id, { "on": false }) // provide a value of false to turn off
            .fail(displayError)
            .done();
    });
}
var AwayTeamScored = function () {
    GOALHORN();
    api = new HueApi(hostname, username);
    api.lights()
    .then(storeLights)
    .then(function () {
        var x = 0;
        var intervalID = setInterval(function () {
            flashAllLights();
            if (++x === 5) {
               clearInterval(intervalID);
            }
        }, 1000);
    } ()
    )
    .done();

};
var HomeTeamScored = function () {
    GOALHORN();
    api = new HueApi(hostname, username);
    api.lights()
        .then(storeLights)
        .then(function () {
            var x = 0;
            var intervalID = setInterval(function () {
                flashAllLights();
                if (++x === 5) {
                    clearInterval(intervalID);
                }
        }, 1000);
    } ()
    )
    .done();
};
var GetTodaysGames = function (success) {
    console.log("getting schedule");
    http.get(api_url + '/api/v1/schedule', function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            var json = JSON.parse(body);
            if (success) {
                success(json.dates[0].games);
            }
        });

    });
};
var displayScores = function(allScores){ //display each score
            console.log("scores: ");
            _.each(allScores, function (score) {
                console.log("\t" + JSON.stringify(score));
            });
};
var GOALHORN = function(){    
    PythonShell.run('HORN.py', function (err) {
        if (err) displayError(err);
        else console.log('GOAL HORN ACTIVATED');
    });
}

api = new HueApi(hostname, username);
api.lights()
    .then(storeLights)
    .then(
        function(){
            // console.log("TESTING GOAL HORN");
            GOALHORN();

            GetTodaysGames(function (data) {
            games = data;
            var scores = [];
            console.log(data.length + " games today:");

            //store each game returned
            _.each(games, function (game) {
                var away = game.teams.away;
                var home = game.teams.home;
                scores.push({
                    'id': game.gamePk,
                    'homeTeam': home.team.triCode,
                    'homeScore': home.score,
                    'awayTeam': away.team.triCode,
                    'awayScore': away.score
                });

                console.log('\t' + game.teams.away.team.triCode + " @ " + game.teams.home.team.triCode);
                console.log("\t\tfeed: " + game.link);

            });

           displayScores(scores);

            setInterval(function () {
                _.each(scores, function (score) {
                    GetBoxScore(score.id, function (boxscore) {
                        var home = boxscore.teams.home;
                        var away = boxscore.teams.away;
                        
                        //if home team scored
                        if (home.teamStats.teamSkaterStats.goals > score.homeScore) {
                            score.homeScore = home.teamStats.teamSkaterStats.goals;
                            console.log(score.homeTeam + " scored!");
                            console.log(JSON.stringify(score));
                            api = new HueApi(hostname, username);
                            HomeTeamScored();
                        }
                        //if away team scored
                        if (away.teamStats.teamSkaterStats.goals > score.awayScore) {
                            score.awayScore = away.teamStats.teamSkaterStats.goals;
                            console.log(score.awayTeam + " scored!");
                            console.log(JSON.stringify(score));
                            api = new HueApi(hostname, username);
                            AwayTeamScored();
                        }

                    });

                });
            }, interval);
         });
        }())
    .done();




