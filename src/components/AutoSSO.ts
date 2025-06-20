import { useEffect } from "react";
import { useEdnaMembership } from "@/hooks/useEdnaMembership";

const AutoSSO = () => {
  const { processAutoSSO } = useEdnaMembership();

  useEffect(() => {
    processAutoSSO();
  }, []);

  return null;
};

export default AutoSSO;
