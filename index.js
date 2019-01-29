const Alexa = require("ask-sdk-core");
const fetch = require("node-fetch");
var poster = "";
var imdbID = "";
var rouletteGenre = "";
var rouletteRating = "";
var rating = "";
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput) {
        const speechText =
            "Welcome to Netflix Roulette! " +
            "Don't know what to watch on netflix? I can help you with that, but first... what genre are you interested in?";
        const reprompt = "Please provide a valid genre.";
        if (supportsAPL(handlerInput)) {
            return handlerInput.responseBuilder
                .addDirective({
                    type: "Alexa.Presentation.APL.RenderDocument",
                    version: "1.0",
                    document: require("./launch.json"),
                    datasources: {
                        bodyTemplate7Data: {
                            type: "object",
                            objectId: "bt7Sample",
                            title: "Netflix Roulette",
                            backgroundImage: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: "https://s3.amazonaws.com/netflix-roulette/netflix_roulette_background.jpg",
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            image: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: "https://s3.amazonaws.com/netflix-roulette/netflix_roulette_background.jpg",
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            logoUrl: "https://images.ecosia.org/XbU-1Yw6S6cjREV8hxagDcwTuzs=/0x390/smart/https%3A%2F%2Fimage.flaticon.com%2Ficons%2Fpng%2F512%2F328%2F328285.png",
                   
                        }
                    }
                })
                .speak(speechText)
                .reprompt(reprompt)
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};

const GenreSelectIntentHandler = {
    canHandle(handlerInput) {
        return (
            (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
                handlerInput.requestEnvelope.request.intent.name ===
                "GenreSelectIntent") ||
           ( handlerInput.requestEnvelope.request.type ===
            "Alexa.Presentation.APL.UserEvent" && handlerInput.requestEnvelope.request.arguments[1] === "MovieGenre")
        );
    },
    handle(handlerInput) {
        console.log("inside genre select intent handler" );
        var movieGenre = "";
        var speechText = "";
        var genrePoster = "";
        var reprompt="";
        const movieDict = {
            "adventure": "5",
            "romance": "4",
            "mystery": "23",
            "fantasy": "13",
            "documentary": "11",
            "thriller": "32",
            "scifi": "26",
            "sci-fi":"26",
            "science fiction": "26",
            "horror": "19",
            "cult": "41",
            "comedy": "9"
        };
        const genrePosters = {
            "fantasy":"https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/fantasy.png",
            "cult": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/cult.jpeg",
            "science fiction": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/scifi.jpg",
            "scifi": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/scifi.jpg",
            "sci-fi": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/scifi.jpg",
            "romance": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/romance.jpg",
            "horror": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/horror.jpg",
            "comedy": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/comedy.jpg",
            "thriller": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/thriller.jpg",
            "adventure": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/adventure.jpg",
            "mystery": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/mystery.jpg",
            "documentary": "https://s3.amazonaws.com/netflix-roulette/GenreBackgroundImages/docu.jpg"
        };

        const request = handlerInput.requestEnvelope.request;
        if (request.type === "Alexa.Presentation.APL.UserEvent") {
            var args = request.arguments[0];
            movieGenre = args;
        } else {
            console.log("genre  in requestMovie---" ,  handlerInput.requestEnvelope.request.intent.slots.movieType.value);
          let requestMovie=  handlerInput.requestEnvelope.request.intent.slots.movieType.value;
          if(requestMovie in movieDict){  movieGenre = requestMovie;}
          
          
        }
        speechText = "Great! Good choice! Now help me with a minimum imdb rating between one to ten.";
        reprompt = "Please choose a valid imdb rating between one to ten.";
        genrePoster = genrePosters[movieGenre];
        console.log("movie genre: ", movieGenre);
        var movieId = "";
        if (movieGenre in movieDict) {
            console.log("movie id ----", movieDict[movieGenre]);
            movieId = movieDict[movieGenre];
        }
        rouletteGenre = movieId;
        if (supportsAPL(handlerInput))
        {
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDirective({
                type: "Alexa.Presentation.APL.RenderDocument",
                version: "1.0",
                document: require("./rating.json"),
                datasources: {
                    bodyTemplate7Data: {
                        type: "object",
                        objectId: "bt7Sample",
                        data: {
                            movieGenre: movieGenre.toUpperCase(),
                            genrePoster: genrePoster

                        }
                    }
                }
            })
            .reprompt(reprompt)
            .getResponse();
        }
        else{
             return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(reprompt)
            .getResponse();
            
        }
    }
};


const RatingSelectIntentHandler = {
    canHandle(handlerInput) {

        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "RatingSelectIntent" ||
            (handlerInput.requestEnvelope.request.type ===
                "Alexa.Presentation.APL.UserEvent" && handlerInput.requestEnvelope.request.arguments[1] === "MovieRating")
        );
    },
    async handle(handlerInput) {
        
        var posterApi = "http://www.omdbapi.com/?i=tt3896198&apikey=4518811a&s=";
        var rouletteUrl =
            "https://api.reelgood.com/roulette/netflix?availability=onAnySource&content_kind=both&";
        var speechText = "This is what you should watch : ";
        var movieTitle = "";
        var movieRating = "";
        var movieOverview = "";
        var reprompt = "Oops, I did'nt quite understand that. Try again?";
        var movieDetails = [];

        if (handlerInput.requestEnvelope.request.type === "Alexa.Presentation.APL.UserEvent") {
            rating = handlerInput.requestEnvelope.request.arguments[0];
        } else if( handlerInput.requestEnvelope.request.intent.slots.rating.value){
            rating = handlerInput.requestEnvelope.request.intent.slots.rating.value;
        }

        console.log("url in genre picker: ", rouletteUrl);
        console.log("you chose minimum rating: ", rating);
        rouletteRating = rating;
        rouletteUrl =
            "https://api.reelgood.com/roulette/netflix?availability=onAnySource&nocache=true&content_kind=both&" +
            "imdb_rating=" +
            rouletteRating +
            "&genre=" +
            rouletteGenre;
        console.log("final url", rouletteUrl);
        await fetchMovie(rouletteUrl).then(data => {
            movieDetails = data;
        });
        movieTitle = movieDetails[0];
        movieRating = movieDetails[1];
        movieOverview = movieDetails[2];
        posterApi += movieTitle;
        await fetchPoster(posterApi).then(data => {
            if(data!=="no-poster"){
            poster = data;
            }
        });
        console.log("poster found: ", poster);
        speechText += movieTitle;
        speechText+=". To get more details on this movie, say 'Alexa, tell me more'. Do you want to reroll? If so, just say 'Alexa, reroll'. If you want to end the session, try 'Alexa, exit'.";
        if (supportsAPL(handlerInput)) {
            return handlerInput.responseBuilder
                .addDirective({
                    type: "Alexa.Presentation.APL.RenderDocument",
                    version: "1.0",
                    document: require("./result.json"),
                    datasources: {
                        bodyTemplate2Data: {
                            type: "object",
                            objectId: "bt2Sample",
                            backgroundImage: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: "",
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    },
                                    {
                                        url: "https://d2o906d8ln7ui1.cloudfront.net/images/BT2_Background.png",
                                        size: "large",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            title: "Netflix Roulette",
                            image: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: poster,
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    },
                                    {
                                        url: "https://d2o906d8ln7ui1.cloudfront.net/images/details_01.png",
                                        size: "large",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            textContent: {
                                title: {
                                    type: "PlainText",
                                    text: movieTitle
                                },
                                primaryText: {
                                    type: "PlainText",
                                    text: movieOverview
                                }
                            },
                            logoUrl: "https://images.ecosia.org/XbU-1Yw6S6cjREV8hxagDcwTuzs=/0x390/smart/https%3A%2F%2Fimage.flaticon.com%2Ficons%2Fpng%2F512%2F328%2F328285.png",
                            hintText: 'Try, " Alexa, reroll."'
                        }
                    }
                })
                .speak(speechText)
                // .withShouldEndSession(true)
                .reprompt(reprompt)
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};

const MovieDetailsIntentHandler = {
    canHandle(handlerInput) {
        return (
            (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
                handlerInput.requestEnvelope.request.intent.name ===
                "MovieDetailsIntent") ||
           ( handlerInput.requestEnvelope.request.type ===
            "Alexa.Presentation.APL.UserEvent" && handlerInput.requestEnvelope.request.arguments[0] === "MovieDetails")
        );
    },
   async handle(handlerInput)
    {
 
        var movieRelease="";
        var movieActors="";
        var movieDirector="";
        var movieRuntime="";
        var movieTitle="";
        var movieRating="";
        var moviePlot="";
      await fetchMovieDetails(imdbID).then(data => {
        console.log("awaiting data in getMovieDetailsIntentHandler", data);
        console.log("poster in getMovieDetailsIntentHandler: " , poster );
        console.log("date released:" , data.released);
        data = JSON.parse(data);
        movieRelease=data.released;
        movieActors=data.actors;
        movieDirector=data.director;
        movieRating=data.imdbRating;
        movieRuntime=data.runtime;
        movieTitle=data.title;
        moviePlot=data.plot;
        
      });
      if (supportsAPL(handlerInput)) {
          movieRuntime=movieRuntime.split(" ")[0];
          var speechText="";
          movieDirector!=="N/A"? speechText+=("The director is " + movieDirector + "."):"";
          movieActors!=="N/A"?speechText+=(" The actors are " + movieActors) + ".":"";
          movieRuntime!=="N/A"?speechText+=(" It is " + movieRuntime + " minutes long."):"";
        //   var speechText="The director is " + movieDirector + " and stars " + movieActors +". It is  "+ movieRuntime + " minutes long.";
        //   if (movieDirector==="N/A")
        //   {
        //       speechText="The stars are " + movieActors +". It has a runtime of  " + movieRuntime + " minutes. ";
        //   }
          speechText+=" If you want to end this session, just say 'Alexa, exit'."
            return handlerInput.responseBuilder
                .addDirective({
                    type: "Alexa.Presentation.APL.RenderDocument",
                    version: "1.0",
                    document: require("./moviedetails.json"),
                    datasources: {
                        bodyTemplate2Data: {
                            type: "object",
                            objectId: "moviedetailsObject",
                            movieRelease:movieRelease,
                            movieActors:movieActors,
                            movieDirector:movieDirector,
                            moviePoster:poster,
                            movieRating:movieRating,
                            movieRuntime:movieRuntime,
                            movieTitle:movieTitle,
                            moviePlot:moviePlot,
                            logoUrl: "https://images.ecosia.org/XbU-1Yw6S6cjREV8hxagDcwTuzs=/0x390/smart/https%3A%2F%2Fimage.flaticon.com%2Ficons%2Fpng%2F512%2F328%2F328285.png"
                        }
                    }
                        }).speak(speechText)
                // .withShouldEndSession(true)
                .reprompt(speechText)
                .getResponse();
      }
    }
}
const NewMovieIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "NewMovieIntent"
        );
    },

    handle(handlerInput) {
        var speechText = "What genre do you wish to watch in?";

        if (supportsAPL(handlerInput)) {
            return handlerInput.responseBuilder
                .addDirective({
                    type: "Alexa.Presentation.APL.RenderDocument",
                    version: "1.0",
                    document: require("./launch.json"),
                    datasources: {
                        bodyTemplate7Data: {
                            type: "object",
                            objectId: "bt7Sample",
                            title: "Netflix Roulette",
                            backgroundImage: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: "",
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    },
                                    {
                                        url: "https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png",
                                        size: "large",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            image: {
                                contentDescription: null,
                                smallSourceUrl: null,
                                largeSourceUrl: null,
                                sources: [{
                                        url: "https://s3.amazonaws.com/netflix-roulette/netflix_roulette_background.jpg",
                                        size: "small",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    },
                                    {
                                        url: "https://d2o906d8ln7ui1.cloudfront.net/images/MollyforBT7.png",
                                        size: "large",
                                        widthPixels: 0,
                                        heightPixels: 0
                                    }
                                ]
                            },
                            logoUrl: "https://images.ecosia.org/XbU-1Yw6S6cjREV8hxagDcwTuzs=/0x390/smart/https%3A%2F%2Fimage.flaticon.com%2Ficons%2Fpng%2F512%2F328%2F328285.png"

                        }
                    }
                })
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak("Sorry, I could not understand the command. Please try again.")
            .reprompt("Sorry, I could not understand the command. Please try again.")
            .getResponse();
    }
};

const FallbackHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.FallbackIntent"
        );
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("I'm sorry, I didn't get that. What did you say?")
            .addConfirmIntentDirective()
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
        );
    },
    handle(handlerInput) {
        const speechText =
            "Please choose a genre and after that a minimum imdb rating and I will help you find a movie!";
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            (handlerInput.requestEnvelope.request.intent.name ===
                "AMAZON.CancelIntent" ||
                handlerInput.requestEnvelope.request.intent.name ===
                "AMAZON.StopIntent")
        );
    },
    handle(handlerInput) {
        const speechText = "Goodbye!";

        return handlerInput.responseBuilder.speak(speechText);
    }
};

function supportsAPL(handlerInput) {
    const supportedInterfaces =
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces["Alexa.Presentation.APL"];
    return aplInterface != null && aplInterface != undefined;
}

const skillBuilder = Alexa.SkillBuilders.custom();
async function fetchPoster(url) {
    var poster = "";
    var myPromise = fetch(url)
        .then(resp => resp.json())
        .then(function (data) {
            console.log("poster data: ", data);
            if(data.hasOwnProperty('Search'))
            {
            poster = data.Search[0].Poster;
            imdbID = data.Search[0].imdbID;
            return poster;
            }
            else 
            return "no-poster";
        })
        .catch( e=>{console.log("ran into error when fetching poster: " , e)});
    return myPromise;
}
async function fetchMovie(url) {
    var title = "";
    var tagline = "";
    var rating = "";
    var overview = "";
    var myPromise = fetch(url)
        .then(resp => resp.json())
        .then(function (data) {
            title = data.title;
            tagline = data.tagline;
            rating = data.imdb_rating;
            overview = data.overview;
            console.log("data... -------------", data);
            console.log("title:", title);
            console.log("tagline:", tagline);
            console.log("rating:", rating);
            return [title, rating, overview];
        })
        .catch(e=>{console.log("failed to fetch movie with error: " , e)});
    return myPromise;
}
async function fetchMovieDetails(imdbID) {
    var url = "http://www.omdbapi.com/?apikey=4518811a&i=" + imdbID;
    var myPromise = fetch(url)
        .then(resp => resp.json())
        .then(function (data) {
            console.log("movie details data: ", data);
            var body = JSON.stringify({
                released:data.Released,
                director:data.Director,
                actors:data.Actors,
                title:data.Title,
                runtime:data.Runtime,
                imdbRating:data.imdbRating,
                plot:data.Plot
            });
            return body;
        }).catch(e=>{console.log("error occurred at fetchMovieDetails: " , e)});
    return myPromise;
}

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        GenreSelectIntentHandler,
        RatingSelectIntentHandler,
        NewMovieIntentHandler,
        CancelAndStopIntentHandler,
        HelpIntentHandler,
        FallbackHandler,
        MovieDetailsIntentHandler
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .addErrorHandlers(ErrorHandler)
    .lambda();