import {
	parseResetPasswordDeepLink,
	processInitialDeepLink,
	subscribeToDeepLinks,
} from "./resetPasswordDeepLink";

describe("parseResetPasswordDeepLink", () => {
	it("parses /auth/reset-password and reads code + email from universal link", () => {
		const payload = parseResetPasswordDeepLink(
			"https://comacademy.fr/auth/reset-password?code=abc123&email=test%40mail.com"
		);

		expect(payload).toEqual({
			code: "abc123",
			email: "test@mail.com",
			path: "auth/reset-password",
		});
	});

	it("parses custom scheme auth/reset-password path", () => {
		const payload = parseResetPasswordDeepLink(
			"comacademy://auth/reset-password?code=abc123"
		);

		expect(payload).toEqual({
			code: "abc123",
			email: null,
			path: "auth/reset-password",
		});
	});

	it("supports legacy token query key", () => {
		const payload = parseResetPasswordDeepLink(
			"https://comacademy.fr/auth/reset-password?token=legacy-token"
		);

		expect(payload).toEqual({
			code: "legacy-token",
			email: null,
			path: "auth/reset-password",
		});
	});

	it("returns null when code is missing", () => {
		const payload = parseResetPasswordDeepLink(
			"https://comacademy.fr/auth/reset-password?email=test%40mail.com"
		);

		expect(payload).toBeNull();
	});

	it("returns null when path does not match reset-password route", () => {
		const payload = parseResetPasswordDeepLink(
			"https://comacademy.fr/auth/verify-email?code=abc123&email=test%40mail.com"
		);

		expect(payload).toBeNull();
	});
});

describe("deep-link lifecycle helpers", () => {
	it("handles cold start via getInitialURL", async () => {
		const getInitialUrl = jest
			.fn<() => Promise<string | null>>()
			.mockResolvedValue("https://comacademy.fr/auth/reset-password?code=abc123");
		const onUrl = jest.fn<(url: string | null) => void>();

		await processInitialDeepLink({ getInitialUrl, onUrl });

		expect(getInitialUrl).toHaveBeenCalledTimes(1);
		expect(onUrl).toHaveBeenCalledWith(
			"https://comacademy.fr/auth/reset-password?code=abc123"
		);
	});

	it("handles background URLs via subscription callback", () => {
		const remove = jest.fn<() => void>();
		const onUrl = jest.fn<(url: string) => void>();

		const subscription = subscribeToDeepLinks({
			addUrlListener: (handler) => {
				handler({
					url: "https://comacademy.fr/auth/reset-password?code=event-code&email=user%40mail.com",
				});
				return { remove };
			},
			onUrl,
		});

		expect(onUrl).toHaveBeenCalledWith(
			"https://comacademy.fr/auth/reset-password?code=event-code&email=user%40mail.com"
		);
		subscription.remove();
		expect(remove).toHaveBeenCalledTimes(1);
	});
});
