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
