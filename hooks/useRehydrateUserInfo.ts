import { getCurrentUserInfo } from "@/lib/user";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const useRehydrateUserSession = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const rehydrateSession = async () => {
      const userInfo = await getCurrentUserInfo({ returnToUI: true });
      if ("error" in userInfo) {
        return;
      }
      if (userInfo) {
        queryClient.setQueryData(["userInfo"], userInfo);
      }
    };

    rehydrateSession();
  }, [queryClient]);
};

export default useRehydrateUserSession;
