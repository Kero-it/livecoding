var orderThumbnails = function(node) {

	var li = node.children('li');
	li.detach().sort(function(a, b) {

	    // convert to integers from strings
	    a = parseInt($(a).attr("data"), 10);
	    b = parseInt($(b).attr("data"), 10);

	    // compare
	    if(a > b) {
	        return -1;
	    } else if(a < b) {
	        return 1;
	    } else {
	        return 0;
	    }

	});
	node.append(li);

};

Date.prototype.toDisplayString = function() {

	var date = this;

	var year = Number(date.getFullYear());
	var month = Number(date.getMonth() + 1);
	var day = Number(date.getDate());

	var parts = date.toTimeString().split(':');

	var hh = Number(parts[0]);
	var mm = parts[1];
	var mode = hh > 11 ? 'PM' : 'AM';
	if (hh > 12) hh -= 12;

	var hhmm = [hh, mm].join(':');

	return [[month, day, year].join('·'), hhmm, mode].join(' ');

}

var populateThumbnails = function(data, node, orderByTime, callback) {

	var processedThumbnails = 0;

	var gists = data.gists;

	// iterate over gists
	for (var i = 0; i < gists.length; i++) {

		var gist = gists[i];

		var gistId = gist.gists._id;
		var time = new Date(gist.gists.modified).getTime();

		// get gist image
		$.getJSON('http://guarded-castle-8005.herokuapp.com/' + gistId + '/' + time + '?callback=?', function(json) {

			var match = _.find(gists, function(v) { return v.gists._id == json.gist; });
			var views = match.gists.views;
			var username = match.username ? match.username : 'anonymous';
			var date = new Date(match.gists.modified);

			var leftInfo = orderByTime ? date.toDisplayString() : username;
			var sortField = orderByTime ? date.getTime() : views;

			var html = '';
			html += '<li data="' + sortField + '">';
			html += '  <a href="/' + json.gist + '">';
			html += '    <img class="thumbnail" width="180" height="135" src="' + json.url + '" />';
			html += '  </a>';
			html += '  <div class="info">';
			html += '    <p class="left">';
			if (!orderByTime) {
				html += '      <a class="username" href="/gists/user/' + username + '">';
			}
			html +=          leftInfo;
			if (!orderByTime) {
				html += '      </a>';
			}
			html += '    </p>';
			html += '    <p class="right"><span class="eye">' + views + '</span><img class="eye" src="/static/img/eye.png" /></p>';
			html += '  </div>';
			html += '</li>';
			node.append(html);

			orderThumbnails(node);

			processedThumbnails++;

			// when all gists have been processed, call callback
			if (processedThumbnails == gists.length) {
				callback && callback(data);
			}

		});

	}

};

var populateThumbnailsFromEndpoint = function(endpoint, node, orderByTime, callback) {

	// get gists
	$.getJSON(endpoint, function(json) {

		populateThumbnails(json, node, orderByTime, callback);

	});

};

