function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function findNearestPointOnTrack( lat, lng, track ) {
	var nearest;
  var shortestdistance=999999999999;
  track.forEach( function(v){
    var distance = getDistance(lat, lng, v.lat, v.lng);
    if( shortestdistance > distance ) {
      shortestdistance = distance;
      nearest = v;
    }
  });
  return nearest;
}

//TODO: Use https://github.com/ewoken/Leaflet.MovingMarker
var moveTimer,ismoving=false;
function moveTo( end, track, marker ) {
  if( ismoving == false )
  {
    ismoving = true;
    var currentPoint = getCurrentPoint(marker.getLatLng(), track);
    var direction = currentPoint.meta.time < end.meta.time ? 'forward' : 'backward';
    
    (function move(direction) {
      var iteration = (direction == "backward") ? -1 : +1;
      currentPoint = track[track.indexOf(currentPoint) + iteration];
      if( (direction == "forward"  && currentPoint.meta.time <= end.meta.time) ||
          (direction == "backward" && currentPoint.meta.time >= end.meta.time) ) {
        marker.setLatLng( L.latLng(currentPoint.lat,currentPoint.lng) ).update();
        moveTimer = setTimeout( function(){ move(direction); }, 1 );
      } else {
        ismoving = false;
        $.event.trigger({type: "movingcomplete"});
      }
    })(direction); 
  }
}

function getCurrentPoint( latlng, track ) {
  return $.grep(track, function(e){
    return (e.lat == latlng.lat && e.lng == latlng.lng);
  }).shift();
}

var subTrackLayer;
function highlightSubTrack( start, end, track ) {
  var startIndex = track.indexOf(start);
  var endIndex = track.indexOf(end);
  var subTrack = track.slice(startIndex, endIndex+1);
  
  if( typeof subTrackLayer !== "undefined" ) {
    map.removeLayer(subTrackLayer);
  }
  subTrackLayer = new L.featureGroup([
    new L.Polyline(
      subTrack, 
      {
        color: 'red', 
        opacity: 0.5
      }
    )
  ]).bindLabel("", labelOptions).addTo(map);
  subTrackLayer.on('mousemove', updateTooltip);
  subTrackLayer.on('click', movetomouse);
  
  map.fitBounds( subTrackLayer.getBounds(), boundOptions );
}

function updateTooltip(e) {
  var trackPoints = gpxTrack.get_trackpoints();
  var nearest = findNearestPointOnTrack(e.latlng.lat, e.latlng.lng, trackPoints);
  var date = nearest.meta.time;
   
  $(".trackTooltip").html(
    '<p>Time: ' + 
      date.getDate() + '.' + parseInt(date.getMonth()+1) + '.' + date.getFullYear() + 
      ' ' + date.getHours() + ':' + date.getMinutes() + 
    '</p><p>Height: ' + nearest.meta.ele + '</p>'
  );
}

function movetomouse(e){
  var trackPoints = gpxTrack.get_trackpoints();
  var nearest = findNearestPointOnTrack(e.latlng.lat, e.latlng.lng, trackPoints);
  moveTo(nearest, trackPoints, showPoint);
}