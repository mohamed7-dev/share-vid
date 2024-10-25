import { useEffect, useState } from "react";

const useDebounce = ({ state, time }: { state: string; time: number }) => {
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(state);
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [time, state]);

  return debouncedValue;
};

export default useDebounce;
