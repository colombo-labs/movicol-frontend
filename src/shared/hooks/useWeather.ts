import { useEffect, useState } from "react";

export function useWeather() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.onLine) { setTemp(14); return; }
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=4.61&longitude=-74.08&current_weather=true",
    )
      .then((r) => r.json())
      .then((d) => setTemp(Math.round(d.current_weather?.temperature ?? 14)))
      .catch(() => setTemp(14));
  }, []);

  return temp;
}
