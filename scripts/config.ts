class configClass {
	
	public mapId: string;
	public gpxFile: string;
	
	public boundOptions: L.Map.FitBoundsOptions;
	public trackLabelOptions: L.LabelOptions;
	public subTrackOptions: L.PolylineOptions;
	
	public constructor() {
		
		this.mapId = "map";
		this.gpxFile = "data/track.min.gpx";
		
		this.boundOptions = {
			paddingBottomRight: L.point(200,10), 
			paddingTopLeft: L.point(10,10),
		}; 
		
		this.trackLabelOptions = {
			className: "trackTooltip",
			direction: "auto",
			/* offset: []  */
		};
		
		this.subTrackOptions = {
			color: "red",
			opacity: 1,
		}
		
	}
}