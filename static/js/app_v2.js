var viewModel;
var client_id = "FOYADK4WSZCXKKGARF2SKEDJ31XUS4SPYZE4QBO40WMZO5AB";
var client_secret = "SI1IQROTUGGYHDIONY5VQTEJPJNFXISJ3ZW0LJQYN3VJQXT3";
var versionFSQ = "20180323";
var myLocal = "-30.034632,-51.217699";
var map;
var datawk;
var urlIcon = 'http://maps.google.com/mapfiles/ms/icons/'

//this is the model for any marker on the map
var Marker = function(data, map, infowindow, bounds){
	var self = this;
	self.favorite = data.favorite;
	self.info_window = data.info_window;
	self.lat = data.lat;
	self.lng = data.lng;
	self.title = data.title;
	self.visible = ko.observable(true);

	var fsqPlaces = getJsonValues("https://api.foursquare.com/v2/venues/search?client_id="+client_id+"&client_secret="+client_secret+"&v="+versionFSQ+"&ll="+self.lat+","+self.lng+"&limit=10&intent=browse;'","json");
	var wikipedia = getJsonValues("https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord="+self.lat+"|"+self.lng+"&gsradius=10&gslimit=50&format=json&origin=*", "json");
	datafq = fsqPlaces.response.venues;
	//check if request to wikipedia API return any value
	if(wikipedia.query.geosearch.length==0){
		datawk = "";
	}else{
		datawk = wikipedia.query.geosearch[0].title;
	}

	self.infos = [datawk, datafq, self.favorite, self.info_window];

	//change icon color base on favorite feature
	if(self.favorite==true){
		icon = {url: urlIcon+'blue-dot.png'};
	}else{
		icon = {url: urlIcon+'red-dot.png'};
	}

	self.marker = new google.maps.Marker({
				  	position: {lat: parseFloat(self.lat), lng: parseFloat(self.lng)},
				  	map: map,
				  	title: self.title,
				  	icon: icon,
				  	animation: google.maps.Animation.DROP
			  });

			  		bounds.extend(self.marker.position);
				 	self.marker.addListener('click', function(){
				  	populateInfoWindow(this, infowindow, self.infos);

			  });
				 	self.marker.addListener('mouseover', function(){
				 		this.setAnimation(google.maps.Animation.BOUNCE);
				 	});
				 	self.marker.addListener('mouseout', function(){
				 		this.setAnimation(null);
				 	});
};
//create a new marker on click event
function createMarker(event){

	var marker;

	if (confirm('Are you sure you want to save this thing into the database?')) {
		  		//get the latitude and longitude of the clicked region
		  		lat = String(event.latLng.lat());
    			lng = String(event.latLng.lng());
    			//show the modal form
			   $('#exampleModal').modal('show');

			   $( "form" ).submit(function( event ) {
					//serialize all the filled inputs
			   		var formArray = $( this ).serializeArray();
			   		var formJson = {};
			   		//create a JSON
			   		for(item in formArray){
			   			formJson[formArray[item]['name']] = formArray[item]['value'];

			   		}
			   		// check if it is a favorite places
			   		if($('input:checked').length === 0){
			   			formJson['favorite'] = 'False';
			   		}
			   		else{
			   			formJson['favorite'] = 'True';
			   		}

    				formJson['lat'] = lat;
    				formJson['lng'] = lng;
    				//save on database
			   		marker = setJsonLocal(formJson);

				  $('#exampleModal').modal('toggle');
				  //clean all the inputs
				  $(this)[0].reset();

				  event.preventDefault();
				  event.stopImmediatePropagation();

				});

			}
			return marker;

}
//to save data on database
function setJsonLocal(data){

	var data = data;
	var marker;
		$.ajax(
				{
					method: 'POST',
				    url: "/templates/save_maker/JSON" ,
				    dataType: "json",
				    async: false,
				    data:  data,
				    success: function(response)
				    {

				    	marker = response;

				    }
	});
		return marker;
}

//handle when maps API does not work
function onErrorMap() {
	alert('There was an error occured with the Google Maps. Please try again later.');
	};
//to get values from APIs
function getJsonValues(url, dataType){
	var data;
		$.ajax(
				{
				    url: url ,
				    dataType: dataType,
				    async: false,
				    success: function(response){
				    	data = response;
					}, error: function() {
    alert('There was an error occured with the API resquest. Please try again later.');
	}});
		return data;
	}

function populateInfoWindow(marker, infowindow, infos ){
	//Check if wikipedia API found some information. This is in case a user create a new marker.
	var link = (infos[0].length > 0) ? '<a href="https://en.wikipedia.org/wiki/'+infos[0]+'" target="_blank">Read more on Wikipedia...</a>':'';


				if (infowindow.marker != marker){
					infowindow.marker = marker;
					infowindow.setContent( '<div class="">'+
									        '<h6>Title: '+ marker.title+'</h6>'+
									      	'<h6>Address: '+ infos[1][0].location.address+'</h6>'+
									        '<h6>Category: '+ infos[1][1].categories[0].shortName+'</h6>'+
									        '<h6>Particular Information: '+ infos[3]+'</h6>'+
									        link+
									       	'</div>');
					infowindow.open(map, marker);
					infowindow.addListener('closeclick', function(){
						infowindow.setMarker = null;
					});
				}

			}


var ViewModel = function(){

	var self = this;


	this.markerList = ko.observableArray();
	// The location of Home
	var home = {lat: -30.0208097, lng: -51.1569194};
	// The map, centered at Home
	var map = new google.maps.Map(
	    document.getElementById('map'), {zoom: 12, center: home});

	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	//i am trying to implement a way to save a marker after click event
	google.maps.event.addListener(map, 'click', function(event){
		console.log(self.markerList());
		self.markerList().push(new Marker(createMarker(event), map, infowindow, bounds));

	});

	//add the saved places to the observablearray witch is responsable to populate de menu filter
	var savedPlaces = getJsonValues("/templates/index/JSON");

	for(var i = 0; i < savedPlaces.length; i ++){
  		this.markerList().push(new Marker(savedPlaces[i], map, infowindow, bounds));
	}

	this.currentMarker = ko.observable(this.markerList());

	this.filterPlaces = ko.observableArray();
	//here it implements the filter action according to the typed keys
	this.searchplace = ko.pureComputed({
		read: function(){
			return ;
		},write: function(key){
			this.markerList().forEach(function(data){
				if(!data.title.toLowerCase().includes(key)){
					data.marker.setVisible(false);
					data.visible(false);
				}
				else{
					data.marker.setVisible(true);
					data.visible(true);
				}
			});
		},
		owner: this
	});

	// this function implements a marker animation when any option on the sidebar is clicked
	this.setMarker = function(clickedMarker){
		self.currentMarker(clickedMarker);
		google.maps.event.trigger(clickedMarker.marker, "mouseover");
		google.maps.event.trigger(clickedMarker.marker, "click");
		google.maps.event.trigger(clickedMarker.marker, "mouseout");
		};
};

viewModel = new ViewModel();

ko.applyBindings(viewModel);
