var viewModel;
var client_id = "FOYADK4WSZCXKKGARF2SKEDJ31XUS4SPYZE4QBO40WMZO5AB";
var client_secret = "SI1IQROTUGGYHDIONY5VQTEJPJNFXISJ3ZW0LJQYN3VJQXT3";
var versionFSQ = "20180323";
var myLocal = "-30.034632,-51.217699";

//this is the model for any marker on the map
var Marker = function(data){

	this.favorite = data.favorite;
	this.info_window = data.info_window;
	this.lat = data.lat;
	this.lng = data.lng;
	this.title = data.title;
	//this.visible = ko.observable(true);
};
//handle when maps API does not work
function onErrorMap() {
	alert('There was an error occured with the Google Maps. Please try again later.');
	};
//this function get the json values from api that is requested
function getJsonValues(url){
	var data;
		$.ajax(
				{
				    url: url ,
				    dataType: "json",
				    async: false,
				    success: function(response){

				    	data = response;

					}, error: function() {
    alert('There was an error occured with the API resquest. Please try again later.');
	}});
		return data;

}
//this function implements a post method to save data/markers in the database
function setJsonLocal(data, map, infowindow, bounds){

	var data = data;
		$.ajax(
				{
					method: 'POST',
				    url: "/templates/save_maker/JSON" ,
				    dataType: "json",
				    async: false,
				    data:  data,
				    success: function(response)
				    {
				        viewModel.markerList.push(new Marker(data));
				        marker = createMarker(map, infowindow, bounds, data);
				        viewModel.markerList().marker = marker;
				    }
	});
}

//places that are already saved in the database
var savedPlaces = getJsonValues("/templates/index/JSON");
var fsqPlaces = getJsonValues("https://api.foursquare.com/v2/venues/search?client_id="+client_id+"&client_secret="+client_secret+"&v="+versionFSQ+"&ll="+myLocal);
var foursquarePlaces = infoFromFoursquare(fsqPlaces);
var places = [savedPlaces, foursquarePlaces]

function infoFromFoursquare(fsqPlaces){
	var lista = [];


	var data = fsqPlaces.response.venues;


	for(const i in data){

			var json = {};
			json['title'] = data[i].name;
			json['lng'] = data[i].location.lng;
			json['lat'] = data[i].location.lat;
			json['favorite'] = false;
			json['info_window'] = "";

			lista.push(json);



	}


	return lista;

}




//function used to create markers and give its some properties
function createMarker(map, infowindow, bounds, savedPlaces){

	var marker = new google.maps.Marker({
				  	position: {lat: parseFloat(savedPlaces.lat), lng: parseFloat(savedPlaces.lng)},
				  	map: map,
				  	title: savedPlaces.title,
				  	animation: google.maps.Animation.DROP
			  });
			  		bounds.extend(marker.position);
				 	marker.addListener('click', function(){
				  	populateInfoWindow(this, infowindow, infos)
			  });
				 	marker.addListener('mouseover', function(){
				 		this.setAnimation(google.maps.Animation.BOUNCE);
				 	});
				 	marker.addListener('mouseout', function(){
				 		this.setAnimation(null);
				 	});
	return marker;
}

function initMap() {
		  // The location of Home
		  var home = {lat: -30.0208097, lng: -51.1569194};
		  // The map, centered at Home
		  var map = new google.maps.Map(
		      document.getElementById('map'), {zoom: 12, center: home});
		  // The marker, positioned at Home

		  var infowindow = new google.maps.InfoWindow();
		  var bounds = new google.maps.LatLngBounds();
		  var count = 0;
		  for(var place = 0; place < places.length; place ++){

	  		for(var i = 0; i < places[place].length; i ++){

		  		marker = createMarker(map, infowindow, bounds, places[place][i]);

				viewModel.markerList()[count].marker = marker;
				map.fitBounds(bounds);
				count++;
				}

			}


		  //here it handle a click event on map to create a new marker
		  google.maps.event.addListener(map, 'click', function(event){


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
			   			formJson['favorite'] = false;
			   		}
			   		else{
			   			formJson['favorite'] = true;
			   		}

    				formJson['lat'] = lat;
    				formJson['lng'] = lng;
    				//save on database
			   		setJsonLocal(formJson, map, infowindow, bounds);

				  $('#exampleModal').modal('toggle');
				  //clean all the inputs
				  $(this)[0].reset();

				  event.preventDefault();
				  event.stopImmediatePropagation();

				});

			}

		});

}


//This function create a info window to each marker
var infos = infoFromFoursquare(fsqPlaces)
function populateInfoWindow(marker, infowindow, infos ){

				if (infowindow.marker != marker){
					infowindow.marker = marker;
					infowindow.setContent( '<div class="info-window">',
									        '<h4>', marker.title, '</h4>',
									        '<h4> (', infos[0], ')</h4>',
									        '<p>',
									          infos[1],
									        '</p>',
									        '<p>', infos[2], '</p>',
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

	//add the saved places to the observablearray witch is responsable to populate de menu filter

	for(var place = 0; place < places.length; place ++){

	  	for(var i = 0; i < places[place].length; i ++){

		  		self.markerList().push(new Marker(places[place][i]));

			}

	}


	this.currentMarker = ko.observable(this.markerList());

	this.typedKey = ko.observable("");
	//here it implements the filter action according to the typed keys
	this.filteredMarkers = ko.computed(function(){

		var key = self.typedKey();

		if(key === ""){

			return self.markerList();

		}
		else{

			var filtered = self.markerList().filter(function(item){

				if(item.title.includes(key)){
					item.marker.setVisible(true);
					return true;
				}
				else{
					item.marker.setVisible(false);
					return false;
				}

			});

			return filtered;
		}

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
