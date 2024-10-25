import { credentialsLogin, logout, registerUsingEmail } from "@/lib/auth";
import { getCurrentUserInfo } from "@/lib/user";
import { UserInfoToUI } from "@/types/user";
import { showToastWithStatus } from "@/utils/alert";
import { handleErorrUI } from "@/utils/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetCurrentUserInfo = () => {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const res = await getCurrentUserInfo({ returnToUI: true });
      if ("error" in res) {
        throw new Error(res.message);
      } else {
        return res as UserInfoToUI;
      }
    },
  });
};

export const useCredentialsLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await credentialsLogin(email, password);
      if ("error" in res) {
        console.log(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus("🥳 Logged in successfully! 🥳", 200);
        return res as UserInfoToUI;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userInfo"], data);
    },
  });
};

export const useCredentialsRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => {
      const res = await registerUsingEmail(username, email, password);
      if ("error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      } else {
        showToastWithStatus(
          "🥳 Account has been registered successfully! 🥳",
          200
        );
        return res;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userInfo"], data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await logout();
      if (res && "error" in res) {
        handleErorrUI(res);
        throw new Error(res.message);
      }
      showToastWithStatus("🥳 Logged out successfully! 🥳", 200);
      return res;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["userInfo"] });
    },
  });
};
