export function truncateString(str: string, num: number) {
	if (str !== undefined) {
		if (str.length > num) {
			return str.slice(0, num) + "...";
		} else {
			return str;
		}
	} else {
		return null;
	}
}
