var request = require('request');
var Spotify = require('spotify-web-api-js');
var s = new Spotify();

var client_id = 'd48e99918eaa4667a5555a2a4dc304e3'; // Your client id
var client_secret = 'c05f9e20f809412d9303c29ce2e7456d'; // Your secret

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
	if (!error && response.statusCode === 200) {

		// use the access token to access the Spotify Web API
		var token = body.access_token;
		var options = {
		  headers: {
			'Authorization': 'Bearer ' + token
		  },
		  json: true
		};
		request.get(options, function(error, response, body) {
			
			s.setAccessToken(token);
			
			var trackID1 = "5mOVGtU5mxgZWfdo8FyxMf";	// Culture Code - Electricity
			s.getAudioAnalysisForTrack(trackID1, function(error, response) {
				var trackBPM1 = response.track.tempo;
				
				console.log("Culture Code - Electricity's Spotify BPM: " + trackBPM1);
			
			});
			
			var trackID2 = "4DHRbvvQyC3mBa3Y0JNl4n";	// Culture Code - Make Me Move
			s.getAudioAnalysisForTrack(trackID2, function(error, response) {
				var trackBPM2 = response.track.tempo;
				
				console.log("Culture Code - Make Me Move's Spotify BPM: " + trackBPM2);
			
			});
			
		});
	}
});
