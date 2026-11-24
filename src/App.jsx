import { useEffect } from "react";
import { useRoute } from "./lib/hooks";
import Site from "./site/Site";

export default function App() {
  const parts = useRoute();
  useEffect(() => {
    document.documentElement.dataset.design = "site";
  }, []);
  return <Site sub={parts} />;
}
