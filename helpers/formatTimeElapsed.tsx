import { differenceInMinutes, differenceInHours, differenceInDays, format } from "date-fns";

export const formatTimeElapsed = (createdAt: string): string => {
	const now = new Date(); // Current time
	const postTime = new Date(createdAt); // Post creation time
	const diffInMinutes = differenceInMinutes(now, postTime);

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
	return format(new Date(createdAt), "dd/MM/yyyy");
};
