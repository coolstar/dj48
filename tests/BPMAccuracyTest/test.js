var client_id = 'd48e99918eaa4667a5555a2a4dc304e3';
var client_secret = 'c05f9e20f809412d9303c29ce2e7456d';

var client64 = window.btoa(client_id + ':' + client_secret);

$.ajax({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    data: {
        "grant_type": 'client_credentials'
    },
    headers: {
        "Authorization": client64
    },
    dataType: 'json',
    success: function (error, response, body) {
		console.log('lol');
        if (!error && response.statusCode === 200) {
			var token = body.access_token;
		}
    }
});

//////////////////////////

var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

spotifyApi.searchTracks('track:electricity%20artist:culture%20code', {'type':'track'}, function(error, response) {
	if (!error && response.statusCode === 200) {
		console.log(response.items[0].id);
	}


});
