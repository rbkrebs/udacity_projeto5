function getWiki(){
		var datawiki;
		var urlWiki = 'https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=-30.032|-51.23035&gsradius=10&gslimit=50&format=json&origin=*';
		var url;
		$.ajax({
			type:"GET",
			url: urlWiki,
				 async: false,
			    dataType:'json',
			    success: function(data) {

			    	datawiki = data.query.geosearch[0].title;
			    	url = "https://en.wikipedia.org/wiki/"+datawiki;


	}});

		return url;
	}