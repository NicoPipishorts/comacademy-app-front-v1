import { resolveBottomSheetCommand } from "@/helpers/bottomSheetVisibility";

describe("resolveBottomSheetCommand", () => {
	it("does nothing on mount, when the sheet starts hidden and unpresented", () => {
		expect(
			resolveBottomSheetCommand({ visible: false, isPresented: false })
		).toBe("none");
	});

	it("presents the sheet when it becomes visible", () => {
		expect(
			resolveBottomSheetCommand({ visible: true, isPresented: false })
		).toBe("present");
	});

	it("dismisses a sheet the parent closed programmatically", () => {
		expect(
			resolveBottomSheetCommand({ visible: false, isPresented: true })
		).toBe("dismiss");
	});

	// The regression: the user pans down or taps the backdrop, the sheet closes
	// itself and reports it, the parent then flips `visible` to false. A second
	// dismiss() here is what kills every later present().
	it("does not dismiss again after the sheet closed itself", () => {
		expect(
			resolveBottomSheetCommand({ visible: false, isPresented: false })
		).toBe("none");
	});

	it("presents again once the sheet is asked to reopen", () => {
		expect(
			resolveBottomSheetCommand({ visible: true, isPresented: false })
		).toBe("present");
	});
});
