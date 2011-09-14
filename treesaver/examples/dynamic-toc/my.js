var neotouch = {
	index : null,
	init : function(index) {
		this.index = index;
		this.getJson();
	},
	getJson : function() {
		var head = document.querySelector("head") || document.documentElement,
		script = document.createElement("script");

		/*
		* YQL Query. Permalink: http://y.ahoo.it/xUfgr
		* Source: http://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml
		*/
		script.src = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D'http%3A%2F%2Fg1.globo.com%2Fdynamo%2Fciencia-e-saude%2Frss2.xml'&format=json&callback=neotouch.updateTOC";

		script.onload = function() {
			(head && script.parentNode) && head.removeChild(script);
		};
		head.appendChild(script);
	},
	updateTOC : function(data) {
		var toc = document.getElementById("toc");
		var items = data.query.results.item;
		var html = "";
		for (var i = 0; i < items.length; i++) {
			this.index.appendChild(new treesaver.Document('one.html', { title: items[i].title }));
			this.index.update();					
		}
	}
};

treesaver.addListener(document, 'treesaver.index.loaded', function (event) {
	neotouch.init(event.index);
});
