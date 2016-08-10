// Empty array to hold origin and destination locations.
var locations = [];

// Route 81 LinkIDs (tells MapQuest API to avoid these road segments in directions).
var LinkIDs = [15138044,15008482,15144794,15094741,15185764,15219841,14881136];

// Set up alternate sets of directions.
var dir_with = MQ.routing.directions().on('success', function(data) {
  renderRouteNarrative(data, '#narrative-with');
});

var dir_without = MQ.routing.directions().on('success', function(data) {
  renderRouteNarrative(data, '#narrative-without');
});

// Variables to hold route layers for alternate routes.
var layer_with, layer_without;

// Map display options.
var options = {
      center: [ 43.0501, -76.1491 ],
      zoom: 13,
      scrollWheelZoom: false
};

$(document).ready(function() {

    // Display maps
    var map_with = L.map('map-with', options).addLayer(MQ.mapLayer());
    var map_without = L.map('map-without', options).addLayer(MQ.mapLayer());

  $('#route').click(function() {

    // If a route later exists, remove it before displaying a new one.
    removeLayers(map_with, map_without);

    // Get the origin and destinate entered by the user.
    var origin = $('#origin').val() || $('#origin').attr('placeholder');
    var destination = $('#destination').val() || $('#destination').attr('placeholder');
    locations.push(origin);
    locations.push(destination);

    // Directions WITH 81 as option.
    dir_with.route({locations});
    layer_with = MQ.routing.routeLayer({
      directions: dir_with,
      fitBounds: true
    });

    // Directiond WITHOUT 81 as option.
    dir_without.route({locations, options: { mustAvoidLinkIds: LinkIDs}});
    layer_without = MQ.routing.routeLayer({
      directions: dir_without,
      fitBounds: true
    });

    // Display both sets of directions.
    map_with.addLayer(layer_with);
    map_without.addLayer(layer_without);

    // Reset locations array.
    locations = [];

  });

  $('#home').click(function() {
    removeLayers(map_with, map_without);
  });

});

// Method to render the specific steps of a route.
function renderRouteNarrative(data, id) {

  var legs = data.route.legs, maneuvers;
  if (legs && legs.length) {
      maneuvers = legs[0].maneuvers;

      // Display specific steps for route.
      var content = '<h3>Directions</h3>';
      content += '<ul>';
      for (var i=0; i < maneuvers.length; i++) {
          content += '<li>' + maneuvers[i].narrative + '</li>';
      }
      content += '</ul>';

  // Display duratsion components.
  content += '<h3>Duration</h3>';
  content += '<ul>';
  content += '<li>Estimated time: ' + Math.round(data.route.time / 60) + ' minutes</li>';
  content += '<li>Distance: ' + Math.round(data.route.distance) + ' miles</li>';
  content += '</ul>';
  }

  $(id).find('.content').append(content);
}

// Method to remove route layers from map.
function removeLayers(map_with, map_without) {
  if(layer_with || layer_without) {
    $('.content').empty();
    map_with.removeLayer(layer_with);
    map_without.removeLayer(layer_without);
    }
    return;
}
