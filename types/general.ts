export interface NavigationType {
	navigate: (screenName: string, params?: Record<string, any>) => void; // Updated to include optional params
	popToTop: (screenName: string) => void; // Updated to match React Navigation's popToTop signature (no parameters)
}
