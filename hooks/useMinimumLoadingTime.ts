import { useEffect, useState } from "react";

type UseMinimumLoadingTimeOptions = {
	isLoading: boolean;
	minimumLoadingTime?: number; // in milliseconds
};

/**
 * Custom hook to enforce a minimum loading time for skeleton screens.
 * This prevents the "glitch" effect when data loads too quickly.
 *
 * @param isLoading - The actual loading state from your data fetch
 * @param minimumLoadingTime - Minimum time to show skeleton (default: 3000ms)
 * @returns A boolean indicating whether to show the skeleton
 *
 * @example
 * const showSkeleton = useMinimumLoadingTime({
 *   isLoading: isLoadingData || isFetchingData,
 *   minimumLoadingTime: 3000 // 3 seconds
 * });
 */
export const useMinimumLoadingTime = ({
	isLoading,
	minimumLoadingTime = 1000,
}: UseMinimumLoadingTimeOptions): boolean => {
	const [showLoading, setShowLoading] = useState(isLoading);
	const [startTime, setStartTime] = useState<number | null>(null);

	useEffect(() => {
		// When loading starts, record the start time
		if (isLoading && startTime === null) {
			setStartTime(Date.now());
			setShowLoading(true);
		}

		// When actual loading finishes
		if (!isLoading && startTime !== null) {
			const elapsed = Date.now() - startTime;
			const remaining = minimumLoadingTime - elapsed;

			if (remaining > 0) {
				// Wait for the remaining time before hiding skeleton
				const timer = setTimeout(() => {
					setShowLoading(false);
					setStartTime(null);
				}, remaining);

				return () => clearTimeout(timer);
			} else {
				// Minimum time already elapsed, hide immediately
				setShowLoading(false);
				setStartTime(null);
			}
		}
	}, [isLoading, startTime, minimumLoadingTime]);

	// Reset when component unmounts or loading restarts
	useEffect(() => {
		return () => {
			setStartTime(null);
		};
	}, []);

	return showLoading;
};
