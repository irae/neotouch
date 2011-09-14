var neotouch = {
	index : null,
	init : function(index) {
		this.index = index;
		this.getJson();
	},
	getJson : function() {
		var head = document.querySelector("head") || document.documentElement,
		script = document.createElement("script");
		script.src = "/treesaver/examples/content-yql-php/toc.php?location=http://g1.globo.com/dynamo/ciencia-e-saude/rss2.xml";
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
