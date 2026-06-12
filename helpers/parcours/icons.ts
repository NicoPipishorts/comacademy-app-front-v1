import quizPinkIcon from "@/assets/imgs/parcours/Quiz-1.png";
import quizGreenIcon from "@/assets/imgs/parcours/Quiz-2.png";
import quizBlueIcon from "@/assets/imgs/parcours/Quiz-3.png";
import quizGreyIcon from "@/assets/imgs/parcours/Quiz-grey.png";
import { ParcoursTimelineWeek } from "@/types/parcours";

const quizAssets = [quizPinkIcon, quizGreenIcon, quizBlueIcon];

export const getParcoursQuizIconForProgramOrder = (programOrder?: number | null) =>
	quizAssets[Math.max(0, Number(programOrder || 1) - 1) % quizAssets.length];

export const getParcoursTimelineActivityIcon = (week: ParcoursTimelineWeek) => {
	const isUpcomingLockedWeek =
		week.status === "not_started" &&
		week.days.every((day) => day.status === "locked");

	return isUpcomingLockedWeek
		? quizGreyIcon
		: getParcoursQuizIconForProgramOrder(week.programOrder);
};
