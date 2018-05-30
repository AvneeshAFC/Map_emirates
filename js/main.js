//jshint loopfunc: true
//A global map variable has been declared.
var map;
//initial function called when google maps key loads
function initMap() {
    //call for the knockout view model
    ko.applyBindings(ViewModel());
}
//function called if map does not load
function errorocc() {
    document.getElementById('map').innerHTML = "MAP LOAD FAILED";
}
//array containing all the info of loactions to be displayed as markers
locations = [{
        title: 'Emirates Stadium',
        location: {
            lat: 51.55573,
            lng: -0.108312
        },
        description: "Emirates Stadium, Arsenal FC",
        id: "4ac518e9f964a520d4ab20e3",
        list: true
    },
    {
        title: 'Arsenal museum',
        selection: false,
        location: {
            lat: 51.556616,
            lng: -0.107092
        },
        description: "The Ken Friar Bridge, London N5, UK",
        id: "4b82d308f964a52062e730e3",
        list: true

    },
    {
        title: 'London Metropolitan University Learning Centre',
        location: {
            lat: 51.553157,
            lng: -0.111993
        },
        description: "London Metropolitan University Learning Centre",
        id: "4f2c2829a17cae7f043521ab",
        list: true
    },
    {
        title: 'Highbury Square',
        location: {
            lat: 51.557778,
            lng: -0.102778
        },
        description: "Highbury Square, former Arsenal stadium",
        id: "4defbcd5227170314bab19ed",
        list: true
    },
    {
        title: 'Islington Central Library',
        location: {
            lat: 51.549197,
            lng: -0.107557
        },
        description: "Islington Central Library",
        id: "4d7e2c472ff9b60cca49a747",
        list: true

    }
];
//Styles array
var styles = [{
        "elementType": 'geometry',
        "stylers": [{
            "color": '#242f3e'
        }]
    },
    {
        "elementType": 'labels.text.stroke',
        "stylers": [{
            "color": '#242f3e'
        }]
    },
    {
        "featureType": 'administrative.locality',
        "elementType": 'labels.text.fill',
        "stylers": [{
            "color": '#d59563'
        }]
    },
    {
        "featureType": 'poi',
        "elementType": 'labels.text.fill',
        "stylers": [{
            "color": '#d59563'
        }]
    },
    {
        "featureType": 'road',
        "elementType": 'geometry',
        "stylers": [{
            "color": '#38414e'
        }]
    },
    {
        "featureType": 'transit.station',
        "elementType": 'labels.text.fill',
        "stylers": [{
            "color": '#d59563'
        }]
    },
    {
        "featureType": 'water',
        "elementType": 'geometry',
        "stylers": [{
            "color": '#17263c'
        }]
    },

];

//knockout viewmodel
var ViewModel = function() {
    //  a constructor to create a new map JS object.
    //the coordinates of Emirates Stadium are given as center
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 51.55573,
            lng: -0.108312
        },
        zoom: 14
    });
    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    var self = this;
    self.error = ko.observable(''); //knockout variable to store value if foursquare api does not load.
    chosen_loc = ko.observable(''); //knockout variable to store input value of list
    self.markers = []; //creation of markers array
    /*This function takes in a COLOR, and then creates a new marker
     icon of that color. The icon will be 21 px wide by 34 high, have an origin
     of 0, 0 and be anchored at 10, 34).*/
    self.makeMarkerIcon = function(markerColor) {
        var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34), new google.maps.Size(21, 34));
        return markerImage;
    };
    // default colour for marker
    var defaultIcon = makeMarkerIcon('ff0000');
    //when marker is clicked colour changes
    var highlightedIcon = makeMarkerIcon('ffff00');
    //Create all markers
    for (var i = 0; i < locations.length; i++) {
        // Get all the info from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var description = locations[i].description;
        var id = locations[i].id;
        var list = locations[i].list;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: id,
            description: description,
            list: ko.observable(list),
        });
        // Push the marker to our array of markers.
        self.markers.push(marker);
        self.markers[i].setVisible(true);
        // Extend boundaries of map or each marker
        bounds.extend(marker.position);
        /* This function populates the infowindow when the marker is clicked. We'll only allow
           one infowindow which will open at the marker that is clicked, and populate based
           on that markers position.*/
        self.populateInfoWindow = function(marker, infowindow) {
            //ajax call for foursquare api
            var FsUrl = "https://api.foursquare.com/v2/venues/";
            var Client_id = "?client_id=BWRYAMHXZFXJ1XJ0MX1D0PH4DYLJ5AKBYA5NLKNZ3UUZUQVL";
            var Client_secret = "&client_secret=JFCKWDVGCXS5AGJQDFSLZBAQ3SKL2ULC3S1K1K3E2VVORELE";
            var Version = "&v=20170928";
            //ajax call
            $.ajax({
                url: FsUrl + marker.id + Client_id + Client_secret + Version,
                dataType: "json",
               success: function(data) {
                    var json = data.response.venue;
                    marker.info = '<p>' + '<b>' + json.name + " , " + json.location.state + " , " + json.location.country + '</b>' + '</p>';
                    if (infowindow.marker != marker) {
                        infowindow.marker = marker;
                        infowindow.setContent(marker.info + '<img src="' + json.photos.groups[0].items[0].prefix + '200x100' + json.photos.groups[0].items[0].suffix + '">');
                        infowindow.open(map, marker);
                        infowindow.addListener('closeclick', function() {
                            infowindow.marker = null;
                        });
                    }
                },
                //if foursquare doesnt load
                error: function(e) {
                    self.error("Data failed to load. Refer developer tools console for errors");
                }
            });
        };

        //  onclickick event to open the large infowindow at each marker.
        // onclickick event to change marker colour
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            bounds.extend(this.position);
            for (var i = 0; i < self.markers.length; i++) {
                if (self.markers[i].id != this.id) {
                    self.markers[i].setIcon(defaultIcon);
                } else {
                    self.markers[i].setIcon(highlightedIcon);
                }
            }
        });
    }
    map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    //used for filteration,when a user clicks on a particular item this function is invoked
    self.oncl = function(val) {
        for (var i = 0; i < self.markers.length; i++) {
            if (self.markers[i].id == val.id) {
                self.populateInfoWindow(markers[i], largeInfowindow);
                markers[i].setIcon(highlightedIcon);
            } else {
                markers[i].setIcon(defaultIcon);
            }
        }
    };
    self.search = function(viewModel, event) {
        if (chosen_loc().length === 0) {
            for (var i = 0; i < self.markers.length; i++) {
                self.markers[i].setVisible(true);
                self.markers[i].list(true);
                markers[i].setIcon(defaultIcon);
            }
        } else {
            for (var j = 0; j < self.markers.length; j++) {
                if (self.markers[j].title.toLowerCase().indexOf(chosen_loc().toLowerCase()) >= 0) {
                    self.markers[j].setVisible(true);
                    self.markers[j].list(true);
                    markers[j].setIcon(defaultIcon);
                } else {
                    self.markers[j].setVisible(false);
                    self.markers[j].list(false);
                    markers[j].setIcon(defaultIcon);
                }
            }
        }
        largeInfowindow.close();
    };
};