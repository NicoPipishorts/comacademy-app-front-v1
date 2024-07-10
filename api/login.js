import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useLoginMutation = (authUrl, onSuccess, onError) => {
	return useMutation({
		mutationFn: (credentials) => axios.post(authUrl, credentials),
		onSuccess,
		onError,
	});
};
