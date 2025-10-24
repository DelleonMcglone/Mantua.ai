import { useCallback, useEffect, useState } from "react";

type UserPoolsState = {
  lastUpdated: number;
};

let userPoolsSnapshot: UserPoolsState = {
  lastUpdated: Date.now(),
};

const userPoolsSubscribers = new Set<(state: UserPoolsState) => void>();

function notifyUserPoolSubscribers() {
  for (const subscriber of userPoolsSubscribers) {
    subscriber(userPoolsSnapshot);
  }
}

export function useUserPools() {
  const [state, setState] = useState<UserPoolsState>(userPoolsSnapshot);

  useEffect(() => {
    userPoolsSubscribers.add(setState);
    return () => {
      userPoolsSubscribers.delete(setState);
    };
  }, []);

  const refetch = useCallback(async () => {
    userPoolsSnapshot = { lastUpdated: Date.now() };
    notifyUserPoolSubscribers();
  }, []);

  return { ...state, refetch };
}
