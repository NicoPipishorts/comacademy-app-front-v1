export type BottomSheetVisibilityCommand = "present" | "dismiss" | "none";

/**
 * Decides what to do to a `BottomSheetModal` when the `visible` prop settles.
 *
 * The rule that matters: `dismiss()` must only ever reach a sheet that is
 * actually on screen. Calling it on one that is not - a sheet never presented,
 * or one the user already closed by panning down or tapping the backdrop -
 * leaves @gorhom/bottom-sheet 5.2.x in an internal "dismissing" status, after
 * which `present()` mounts the portal but never renders it. The sheet then
 * opens exactly once and is silently dead from then on.
 */
export const resolveBottomSheetCommand = ({
	visible,
	isPresented,
}: {
	visible: boolean;
	isPresented: boolean;
}): BottomSheetVisibilityCommand => {
	if (visible) {
		return "present";
	}

	return isPresented ? "dismiss" : "none";
};
