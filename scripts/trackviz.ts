/// <reference path="app.ts" />

class trackvizClass {
	
	public trackPoints: Array<trackPoint>;
	
	private currentMarker: L.Marker;
	private map: L.Map;
	private gpxTrack;
	private isMoving: boolean = false;
	private movingTimer: number;
	private subTrack: L.LayerGroup<any>;
	
	public constructor(map: L.Map, gpxFile: string) {
		var self = this;
		
		self.map = map;	
		self.gpxTrack = new L.GPX(gpxFile, {async: true});
		
		self.gpxTrack.on('loaded', function(e){
			self.trackPoints = self.gpxTrack.get_trackpoints();
			self.currentMarker = L.marker(self.trackPoints[0], {
				icon: L.divIcon({
					className: 'leaflet-div-icon showpoint',
					html: 'x',
				})
			}).addTo(map);
			
			$.grep(self.gpxTrack.getLayers().shift().getLayers(), function(e: any){
				return typeof e.getLatLngs == "function";
			}).shift().bindLabel("", conf.trackLabelOptions);
			
			self.gpxTrack.on('mousemove', function(e:L.LeafletMouseEvent) {
				var trackPoint = self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng);
				//TODO: refactor time formating, take care of timezone support
				var date = trackPoint.meta.time;
				var month = date.getMonth()+1;
				$(".trackTooltip").html(
					'<p>Time: ' + 
					date.getDate() + '.' + month + '.' + date.getFullYear() + 
					' ' + date.getHours() + ':' + date.getMinutes() + 
					'</p><p>Height: ' + trackPoint.meta.ele + '</p>'
				);
			});
			self.gpxTrack.on('click', function(e:L.LeafletMouseEvent) {
				self.moveTo(self.findNearestTrackPoint(e.latlng.lat, e.latlng.lng));
			});
			
			/** experimental */
			var trackArr = [];
			self.trackPoints.forEach(function(e: trackPoint){
				trackArr.push([e.lat,e.lng]);
			});

			
			console.log(trackArr);
			
			var Marker = L.Marker.movingMarker(trackArr, 3000, 
			{
				icon: L.divIcon({
					className: 'leaflet-div-icon showpoint',
					html: 'AY',
				})
			}).addTo(self.map);
			Marker.once('click', function(){
				console.log('start');
				Marker.start();
			});
			/********************* */
				
			self.map.fitBounds(self.gpxTrack.getBounds(), conf.boundOptions);
		}).addTo(self.map);
	}
	
	//TODO: refactor with https://github.com/ewoken/Leaflet.MovingMarker
	public moveTo(destination: trackPoint) {
		var self = this;
		if(!self.isMoving) {
			self.isMoving = true;
			var currentTrackPoint = self.getTrackPointByLatlng(self.currentMarker.getLatLng());
			var trackPointIndex = self.trackPoints.indexOf(currentTrackPoint);
			var bBackwards = currentTrackPoint.meta.time > destination.meta.time ? true : false;
			
			(function move(bBackwards: boolean) {
				var iteration = bBackwards ? -1 : +1;
				trackPointIndex = trackPointIndex + iteration;
				currentTrackPoint = self.trackPoints[trackPointIndex];
				if( (!bBackwards && currentTrackPoint.meta.time <=destination.meta.time) ||
					( bBackwards && currentTrackPoint.meta.time >= destination.meta.time) ) {
					self.currentMarker.setLatLng( L.latLng(currentTrackPoint.lat,currentTrackPoint.lng) ).update();
					self.movingTimer = setTimeout( function(){ move(bBackwards); }, 1 );
				} else {
					self.isMoving = false;
					//$.event.trigger({type: "movingcomplete"});
				}
				})(bBackwards); 
		}
	}
	
	public stopMoving() {
		var self = this;
		clearTimeout(self.movingTimer);
		self.isMoving = false;
	}
	
	public highlightSubTrack(start: trackPoint, end: trackPoint) {
		var self = this;
		var startIndex = self.trackPoints.indexOf(start);
		var endIndex = self.trackPoints.indexOf(end);
		var track = self.trackPoints.slice(startIndex, endIndex+1);
		
		if(self.subTrack) {
			self.map.removeLayer(self.subTrack);
		}
		self.subTrack = new L.FeatureGroup([
			new L.Polyline( track, conf.subTrackOptions)				
		]).bindLabel("", conf.trackLabelOptions).addTo(self.map);
	}
	
	private getTrackPointByLatlng(latlng: L.LatLng) { 
		var self = this;
		return $.grep(self.trackPoints, function(e){
			return (e.lat == latlng.lat && e.lng == latlng.lng);
		}).shift();
	}
	
	private findNearestTrackPoint(lat: number, lng: number) {
		var self = this;
		var nearest: trackPoint;
		var shortestDistance = 9999;
		self.trackPoints.forEach( function(trackPoint){
			var distance = helper.getDistance(lat, lng, trackPoint.lat, trackPoint.lng);
			if(shortestDistance > distance) {
				shortestDistance = distance;
				nearest = trackPoint;
			}
		});
		return nearest;
	}
}