<!doctype html>
<html>
<body>
	<div class="chrome">
		<div class="viewer">
			<div class="controls">
				<div class="pagewidth">
					<button class="prev">&#9664;</button>
					<span class="pagenumbers"><br>
						<!-- <span data-bind="pagenumber">1</span> /
						<span data-bind="pagecount">5</span> -->
					</span>
					<button class="next">&#9654;</button>
				</div>
			</div>
		</div><!-- /.viewer -->
	</div><!-- /.chrome -->

	<div class="grid">
		<div data-ts-template="document">
			<div class="{{type}}">
				<header>
					<!-- This is a conditional, it will only be evaluated if the JSON
					file has a title property for this document. The index.html
					page does not have a title property in the JSON so no title
					will be displayed. -->
					{{#title}}
					{{title}}
					{{/title}}
				</header>

				<div class="column"></div>

				<footer>
					<!-- Again a conditional, but this time it checks for the availability
					of an object. If it is found, it enters a new scope and makes the
					properties at that level available. -->
					{{#publication}}
					{{name}}, {{time}}
					{{/publication}}
				</footer>
			</div>
		</div>
	</div><!-- /#grid -->

	<div class="grid cols-2">
		<div data-ts-template="document">
			<div class="{{type}}">
				<header>
					{{#title}}
					{{title}}
					{{/title}}
				</header>

				<div class="container cols-2" data-sizes="title double"></div>
				<div class="column"></div>
				<div class="container col-2" data-sizes="single"></div>
				<div class="column col-2"></div>

				<footer>
					{{#publication}}
					{{name}}, {{time}}
					{{/publication}}
				</footer>
			</div>
		</div>
	</div><!-- /#grid -->

	<div class="grid cols-3">
		<div data-ts-template="document">
			<div class="{{type}}">
				<header>
					{{#title}}
					{{title}}
					{{/title}}
				</header>

				<div class="container cols-3" data-sizes="title"></div>
				<div class="column"></div>
				<div class="container col-2 cols-2" data-sizes="double"></div>
				<div class="column col-2"></div>
				<div class="container col-3" data-sizes="single"></div>
				<div class="column col-3"></div>

				<footer>
					{{#publication}}
					{{name}}, {{time}}
					{{/publication}}
				</footer>
			</div>
		</div>
	</div><!-- /#grid -->

</body>
</html>
