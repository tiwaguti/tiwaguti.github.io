function loadPubList(targetFile) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = checkReadyState;
	request.open("get", targetFile, true);	// async

	function checkReadyState() {
		// httpでなくfileプロトコルを使っているとstatusが0になる
		if (request.readyState != 4) return;

		// proceed when load is completed
		if (document.readyState == "loading") {
			document.addEventListener('readystatechange', function (evt) {
				switch (evt.target.readyState) {
					case "interactive":
						// The document has finished loading. We can now access the DOM elements.
						onLoadComplete(request.responseText);
						break;
					default:
						break;
				}
			}, false);
		} else {
			onLoadComplete(request.responseText);
		}
	}

	request.send(null);
}

function onLoadComplete(responseText) {
	var pubs = JSON.parse(responseText);
	pubs.sort(function (a, b) {
		return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
	});

	var elems = document.getElementsByClassName("pub-list");
	Array.prototype.forEach.call(elems, function (elem) {
		// filter publications
		var filtered = pubs.filter(function (pub) {
			var rval = true;
			Object.keys(elem.dataset).forEach(function (key) {
				rval = rval && (key == "formatter" || String(pub[key]) == String(elem.dataset[key]));
			});
			return rval;
		});

		var html = generateTable(filtered, elem.dataset.formatter);
		elem.insertAdjacentHTML('afterbegin', html);
	});
}

function generateTable(pubs, formatName) {
	var tableItems = pubs.map(function (item, i) {
		// format attributes
		var date = new Date(item.date);
		var authors = item.author ? item.author.join(", ") : "";
		var media = item.media ? item.media.reduce(function (x, y) {
			return x + `<a href=\"${y[1]}\">[${y[0]}]</a> `
		}, "") : "";
		var award = item.award ? item.award.reduce(function (x, y) {
			return x + `<a href=\"${y[1]}\" class="pub-list-award">[${y[0]}]</a> `
		}, "") : "";

		// convert to html
		var formatter = {
			"jrnl": `<tr><td>${i + 1}.</td><td>${authors}, \"${item.title}\", ${item.journal}, Vol. ${item.volume}, Number. ${item.number}, ${item.pages}, ${date.getFullYear()}.${date.getMonth()}. ${award} ${media}</td></tr>`,
			"conf": `<tr><td>${i + 1}.</td><td>${authors}, \"${item.title}\", ${item.booktitle}, ${date.getFullYear()}.${date.getMonth() + 1}. ${award} ${media}</td></tr>`
		};
		return formatter[formatName];
	});

	return "<table>" + tableItems.join("\n") + "</table>";
}


window.addEventListener('DOMContentLoaded', function () {	// async load
	loadPubList("./publist/publications.json");
});
