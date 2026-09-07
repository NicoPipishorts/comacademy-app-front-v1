import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject, useCallback, useEffect, useRef } from "react";

import { resolveBottomSheetCommand } from "@/helpers/bottomSheetVisibility";

/**
 * Drives a `BottomSheetModal` from a boolean `visible` prop.
 *
 * Only ever dismisses a sheet that is actually on screen - see
 * `resolveBottomSheetCommand` for why a stray `dismiss()` permanently breaks
 * the sheet in @gorhom/bottom-sheet 5.2.x.
 *
 * A sheet closed by the user (pan down, backdrop tap) closes itself, so the
 * caller MUST report that back: pass the returned callback to the sheet's
 * `onDismiss`, before the `onClose` that flips `visible`. Skip it and the
 * parent's `visible -> false` update is indistinguishable from a programmatic
 * close, which fires the stray `dismiss()` and the sheet never reopens.
 */
export default function useBottomSheetVisibility(
	ref: RefObject<BottomSheetModal | null>,
	visible: boolean,
) {
	const presentedRef = useRef(false);

	useEffect(() => {
		const command = resolveBottomSheetCommand({
			visible,
			isPresented: presentedRef.current,
		});

		if (command === "present") {
			presentedRef.current = true;
			ref.current?.present();
			return;
		}

		if (command === "dismiss") {
			presentedRef.current = false;
			ref.current?.dismiss();
		}
	}, [ref, visible]);

	return useCallback(() => {
		presentedRef.current = false;
	}, []);
}
