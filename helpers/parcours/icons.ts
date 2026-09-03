import quizPinkIcon from "@/assets/imgs/parcours/Quiz-1.png";
import quizGreenIcon from "@/assets/imgs/parcours/Quiz-2.png";
import quizBlueIcon from "@/assets/imgs/parcours/Quiz-3.png";
import { ParcoursTimelineWeek } from "@/types/parcours";

const quizAssets = [quizPinkIcon, quizGreenIcon, quizBlueIcon];

export const getParcoursQuizIconForProgramOrder = (programOrder?: number | null) =>
	quizAssets[Math.max(0, Number(programOrder || 1) - 1) % quizAssets.length];

// Always use the native colored quiz icon, including for locked/upcoming weeks.
// (Previously swapped to a desaturated Quiz-grey.png for upcoming locked weeks.)
export const getParcoursTimelineActivityIcon = (week: ParcoursTimelineWeek) =>
	getParcoursQuizIconForProgramOrder(week.programOrder);
