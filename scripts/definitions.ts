interface trackPoint {
	lat: number;
	lng: number;
	meta: {
		distFromLast: number;
		distTotal: number;
		ele: number;
		milliSpeed: number;
		time: Date;
		timeFromLast: number;
	}
}