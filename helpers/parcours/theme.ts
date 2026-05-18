import { colorPink } from "@/constants/colors";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const capitalize = (value: string) =>
	value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const normalizeThemeColor = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	if (raw.startsWith("#")) {
		return raw;
	}

	if (/^[0-9A-Fa-f]{6}$/u.test(raw) || /^[0-9A-Fa-f]{3}$/u.test(raw)) {
		return `#${raw}`;
	}

	return raw;
};

export const resolveParcoursAccentColor = (
	...candidates: (string | null | undefined)[]
) => {
	for (const candidate of candidates) {
		const color = normalizeThemeColor(candidate);
		if (color) {
			return color;
		}
	}

	return colorPink;
};

const expandHex = (value: string) => {
	if (/^#[0-9A-Fa-f]{3}$/u.test(value)) {
		return `#${value
			.slice(1)
			.split("")
			.map((char) => `${char}${char}`)
			.join("")}`;
	}

	return value;
};

export const mixParcoursColorWithWhite = (
	value: string | null | undefined,
	weight = 0.82
) => {
	const color = normalizeThemeColor(value);

	if (!color || !/^#[0-9A-Fa-f]{6}$/u.test(expandHex(color))) {
		return colorPink;
	}

	const safeColor = expandHex(color);
	const red = Number.parseInt(safeColor.slice(1, 3), 16);
	const green = Number.parseInt(safeColor.slice(3, 5), 16);
	const blue = Number.parseInt(safeColor.slice(5, 7), 16);

	const mixChannel = (channel: number) =>
		Math.round(channel + (255 - channel) * Math.min(Math.max(weight, 0), 1));

	return `rgb(${mixChannel(red)}, ${mixChannel(green)}, ${mixChannel(blue)})`;
};

export const formatParcoursDayDate = (
	value?: string | null,
	fallback?: string | null
) => {
	if (fallback && fallback.trim().length > 0) {
		return fallback;
	}

	if (!value) {
		return "Jour du parcours";
	}

	try {
		return capitalize(format(new Date(value), "EEEE d MMMM yyyy", { locale: fr }));
	} catch {
		return "Jour du parcours";
	}
};
