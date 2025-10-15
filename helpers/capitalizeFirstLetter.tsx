export function CapitalizeFirstLetter(text: string) {
	if (!text) return text;
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function LowerCaseFirstLetter(text: string) {
	if (!text) return text;
	return text.toLowerCase();
}
