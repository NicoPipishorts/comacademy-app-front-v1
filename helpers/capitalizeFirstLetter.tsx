export function CapitalizeFirstLetter(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function LowerCaseFirstLetter(text: string) {
	return text.charAt(0).toLowerCase() + text.slice(1);
}
