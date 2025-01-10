import moment from "moment";

export const formatTimeElapsed = (createdAt: string): string => {
	const now = moment(); // Current time
	const postTime = moment(createdAt); // Post creation time
	const diffInMinutes = now.diff(postTime, "minutes");

	if (diffInMinutes <= 59) {
		return `${diffInMinutes} mn`;
	}

	const diffInHours = now.diff(postTime, "hours");
	if (diffInHours <= 23) {
		return `${diffInHours} h`;
	}

	const diffInDays = now.diff(postTime, "days");
	if (diffInDays <= 2) {
		return `${diffInDays} j`;
	}

	// If more than 2 days, return the formatted date
	return moment(createdAt).format("DD/MM/YYYY");
};
