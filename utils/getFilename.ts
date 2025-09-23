// Works with absolute or relative URLs and strips ?query / #hash
export const getFilename = (urlOrPath?: string | null): string | null => {
	if (!urlOrPath) return null;
	const clean = urlOrPath.split(/[?#]/)[0]; // remove ?... or #...
	const parts = clean.split("/");
	return parts.pop() || null; // last segment
};
