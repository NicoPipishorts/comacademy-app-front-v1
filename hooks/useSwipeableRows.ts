import { useCallback, useRef, useState } from "react";

type SwipeableLike = { close: () => void } | null;

/**
 * Tracks the currently opened swipeable row in a list and offers a way
 * to close it (used when the user taps outside or opens another row).
 */
export default function useSwipeableRows() {
	const [openedSwipeable, setOpenedSwipeable] = useState<SwipeableLike>(null);
	const swipeableRefs = useRef<Record<string, any>>({});

	const closeOpenedSwipeable = useCallback(() => {
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	}, [openedSwipeable]);

	return {
		openedSwipeable,
		setOpenedSwipeable,
		swipeableRefs,
		closeOpenedSwipeable,
	};
}
