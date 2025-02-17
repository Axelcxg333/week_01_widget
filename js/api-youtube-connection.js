const settings = {
	async: true,
	crossDomain: true,
	url: 'https://youtube138.p.rapidapi.com/auto-complete/?q=desp&hl=en&gl=US',
	method: 'GET',
	headers: {
		'x-rapidapi-key': '18468dc8a4mshbe36a22646a6722p152df8jsnc101d7fe71e4',
		'x-rapidapi-host': 'youtube138.p.rapidapi.com'
	}
};

$.ajax(settings).done(function (response) {
	console.log(response);
});