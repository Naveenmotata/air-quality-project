import { useState, useEffect } from "react";
import { RadialBarChart, RadialBar, Legend } from "recharts";

export default function AirQuality() {
  const [aqi, setAqi] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          try {
            // Fetch AQI Data
            const aqiUrl = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${API_TOKEN}`;
            const aqiResponse = await fetch(aqiUrl);
            const aqiResult = await aqiResponse.json();
            if (aqiResult.status === "ok") {
              setAqi(aqiResult.data.aqi);
            } else {
              setError("Failed to fetch AQI data.");
            }

            // Fetch Address using Reverse Geocoding
            const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            const geoResponse = await fetch(geoUrl);
            const geoResult = await geoResponse.json();
            if (geoResult.display_name) {
              setAddress(geoResult.display_name);
            } else {
              setError("Failed to fetch address.");
            }
          } catch (err) {
            setError("Error fetching data.");
          }
        },
        (err) => {
          setError("Location access denied.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: "Good", color: "#00E400", mask: "No mask needed" };
    if (aqi <= 100) return { status: "Moderate", color: "#FFFF00", mask: "Optional mask" };
    if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", color: "#FF7E00", mask: "N95 recommended" };
    if (aqi <= 200) return { status: "Unhealthy", color: "#FF0000", mask: "N95 or higher required" };
    if (aqi <= 300) return { status: "Very Unhealthy", color: "#8F3F97", mask: "N99 or P100 required" };
    return { status: "Hazardous", color: "#7E0023", mask: "Stay indoors, wear N100" };
  };

  const aqiInfo = aqi !== null ? getAQIStatus(aqi) : null;
  const chartData = [{ name: "AQI", value: aqi || 0, fill: aqiInfo ? aqiInfo.color : "#ccc" }];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      


      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">🌍 Air Quality Index (AQI)</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {aqi !== null ? (
              <>
                {/* AQI Radial Bar Chart */}
                <RadialBarChart width={300} height={250} cx={150} cy={125} innerRadius={50} outerRadius={100} barSize={20} data={chartData}>
                  <RadialBar minAngle={15} label={{ position: "insideStart", fill: "#fff" }} background clockWise dataKey="value" />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: 20 }} />
                </RadialBarChart>
                <h3 className="text-lg font-bold" style={{ color: aqiInfo.color }}>AQI: {aqi}</h3>
                <p className="text-gray-600">{aqiInfo.status}</p>
                <p className="mt-2 text-sm">Mask Recommendation: <b>{aqiInfo.mask}</b></p>
              </>
            ) : (
              <p>Fetching AQI data...</p>
            )}
            {address && <p className="mt-4 text-gray-500">📍 Location: {address}</p>}
          </>
        )}
      </div>
    </div>
  );
}
