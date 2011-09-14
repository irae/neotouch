

var yqlquery,
	config = {
		yqltable: 'nyt.newswire',
		table_url: 'https://raw.github.com/irae/yql-tables/master/nyt/nyt.newswire.xml',
		extra_query: 'apikey="467ee4300d69ba81c8973463b76e6860:0:62339399" and item_type="Article"'
	};


/**************************
***************************
**************************/

yqlquery = 'select * from '+config.yqltable;

if(config.table_url) {
	yqlquery = 'USE "'+config.table_url+'" AS '+config.yqltable+'; ' + yqlquery;
}

if(config.extra_query) {
	yqlquery += ' where '+config.extra_query;
}

console.info('yqlquery ==> ',yqlquery);

$.ajax({
	type: 'GET',
	dataType: 'jsonp',
	url:'http://query.yahooapis.com/v1/public/yql',
	data:{
		format:'json',
		q:yqlquery
	},
	error: function() {
		alert('Something whent wrong retrieving from YQL. It might be our problem or something with YQL cache.')
	},
	success:function(data) {
		console.info('YQL results:')
		console.dir(data);
	}
});



