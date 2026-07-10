import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	format,
} from "date-fns";

export const formatTimeElapsed = (createdAt: string): string => {
	if (!createdAt) {
		return "";
	}

	const now = new Date();
	const postTime = new Date(createdAt);
	const timestamp = postTime.getTime();

	if (!Number.isFinite(timestamp) || timestamp <= 0) {
		return "";
	}

	const diffInMinutes = differenceInMinutes(now, postTime);

	if (diffInMinutes < 0) {
		return "";
	}

	if (diffInMinutes <= 59) {
		return `${diffInMinutes} mn`;
	}

	const diffInHours = differenceInHours(now, postTime);
	if (diffInHours <= 23) {
		return `${diffInHours} h`;
	}

	const diffInDays = differenceInDays(now, postTime);
	if (diffInDays <= 2) {
		return `${diffInDays} j`;
	}

	// If more than 2 days, return the formatted date
	return format(postTime, "dd/MM/yyyy");
};
