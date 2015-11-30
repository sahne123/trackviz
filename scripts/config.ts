class configClass {
	
	public mapId: string;
	public gpxFile: string;
	public movingDuration: number;
	
	public boundOptions: L.Map.FitBoundsOptions;
	public trackLabelOptions: L.LabelOptions;
	public subTrackOptions: L.PolylineOptions;
	public currentMarkerIconOptions: L.ExtraMarkersOptions;
	
	public constructor() {
		
		this.mapId = "map";
		this.gpxFile = "data/track.gpx";
		this.movingDuration = 3000;
		
		this.boundOptions = {
			paddingBottomRight: L.point(200,10), 
			paddingTopLeft: L.point(10,10),
		}; 
		
		this.trackLabelOptions = {
			className: "trackTooltip",
			direction: "auto",
			/* noHide: true, */
			/* offset: []  */
		};
		
		this.currentMarkerIconOptions = {
			icon: "glyphicon-screenshot",
			prefix: "glyphicon",
			shape: "square",
			markerColor: "green-dark",
		}
		
		this.subTrackOptions = {
			color: "red",
			opacity: 1,
		}
		
	}
}