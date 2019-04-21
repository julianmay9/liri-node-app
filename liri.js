require("dotenv").config();

var keys = require('./keys.js');
var Spotify = require('node-spotify-api');
var bandsintown = require('bandsintown')('codingbootcamp');
var request = require('request');
var fs = require('fs');
var inquirer = require('inquirer');
var axios = require('axios');


var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});


function spotifyThis(songChoice) {

    spotify.search({
        type: 'track',
        query: songChoice,
        limit: 10
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log("Artist:", data.tracks.items[0].album.artists[0].name);
        console.log("Track: ", data.tracks.items[0].name);
        console.log("Listen here:  ", data.tracks.items[0].preview_url);
        console.log("Album: ", data.tracks.items[0].album.name);
        var songResult = [];
        data.tracks.items.forEach(track => {
            var song = {
                Artist: track.album.artists[0].name,
                Track: track.name,
                Preview: track.href,
                Album: track.name
            }
            songResult.push(song);

            fs.appendFile("log.txt", "\nArtist: " + song.Artist + "\nTrack: " + song.Track + "\nPreview: " + song.Preview + "\nAlbum: " + song.Album, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("log.txt was updated");
                }
            });
        });
    });
}

function bandsInTown(artistChoice) {
    axios.get("https://rest.bandsintown.com/artists/" + artistChoice + "/events?app_id=codingbootcamp").then(
        function(response) {
            var concert = response.data;
            for(var i = 0; i < response.data.length; i++) {
                // console.log("Venue Name: " + concert[i].venue.name);
                // console.log("City: " + concert[i].venue.city);
                var date = concert[i].datetime.slice(0, 10);
                // console.log("Date: " + date.slice(5, 10) + "-" + date.slice(0, 4));
                var eventInfo = {
                    Venue: concert[i].venue.name,
                    City: concert[i].venue.city,
                    Date: date.slice(5, 10) + "-" + date.slice(0, 4),
                }
                console.log(eventInfo);

                fs.appendFile("log.txt", "\nVenue: " + eventInfo.Venue + "\nCity: " + eventInfo.City + "\nDate: " + eventInfo.Date, function (err) {
                    if (err) {
                        return console.log(err);
                    } else {
                        console.log("log.txt is showing " + parseInt(response.data.length) + " concerts for your chosen artist.")
                    }
                });
            }
        }
    );
}

function movieSearch(title) {
    var URL = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy";
    request(URL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movie = {
                Title: JSON.parse(body).Title,
                Release_Year: JSON.parse(body).Year,
                IMDB_Rating: JSON.parse(body).imdbRating,
                Rotten_Tomatoes_Rating: JSON.parse(body).Ratings[1].Value,
                Country: JSON.parse(body).Country,
                Language: JSON.parse(body).Language,
                Plot: JSON.parse(body).Plot,
                Actors: JSON.parse(body).Actors,
            }

            console.log(movie);

            fs.appendFile("log.txt", "\nTitle: " + movie.Title + "\nYear: " + movie.Year + "\nIMDB Rating: " + movie.IMDB_Rating + "\nRotten Tomatoes Rating: " + movie.Rotten_Tomatoes_Rating + "\nCountry: " + movie.Country + "\nLanguage: " + movie.Language + "\nPlot: " + movie.Plot + "\nActors: " + movie.Actors, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("log.txt was updated");
                }
            });
        } else {
            console.log(error);
            console.log(response.statusCode);
        }
    });
}

function doWhatItSays() {
    // Reads the random text file and passes it to the spotify function
    fs.readFile("random.txt", "utf8", function(err, data) { 
        if(command === "spotify-this-song") {
            spotifyThis(parameter);
            } else if(command === "movie-this") {
                movieSearch(parameter);
            } else if(command === "concert-this") {
                bandsInTown(parameter);
            } else {
                console.log("Please update the command variable in random.txt");
            }
        });
}

var questions = [{
    type: 'list',
    name: 'programs',
    message: 'What would you like to search for?',
    choices: ['Song', 'Movie', 'Concert', 'Random']
},
{
    type: 'input',
    name: 'movieChoice',
    message: 'What\'s the name of the movie you want to watch?',
    when: function(answers) {
        return answers.programs == 'Movie';
    }
},
{
    type: 'input',
    name: 'songChoice',
    message: 'What\'s the name of the song you want to listen to?',
    when: function(answers) {
        return answers.programs == 'Song';
    }
},
{
    type: 'input',
    name: 'artistChoice',
    message: 'What\'s the name of the artist you\'re searching for?',
    when: function(answers) {
        return answers.programs == 'Concert';
    }
}
];

inquirer.prompt(questions).then(answers => {
    switch (answers.programs) {
        case 'Song':
            spotifyThis(answers.songChoice);
            break;
        case 'Movie':
            movieSearch(answers.movieChoice);
            break;
        case 'Concert':
            bandsInTown(answers.artistChoice);
            break;
        case 'Random':
            doWhatItSays();
            break;
        default:
            console.log('LIRI doesn\'t accept that command');
    }
});