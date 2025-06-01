import type { VercelRequest, VercelResponse } from "@vercel/node";

// For processing your data and pairing values:
function processWeatherData(data) {
    // Extract values by tagId
    const tag258Values = data.find(trend => trend.tagId === 258)?.values || [];
    const tag259Values = data.find(trend => trend.tagId === 259)?.values || [];
    
    // Create maps for quick lookup by timestamp
    const baseMap = new Map();
    const heightMap = new Map();
    
    tag258Values.forEach(item => {
        if (item.timestamp) {
            baseMap.set(item.timestamp, item.value);
        }
    });
    
    tag259Values.forEach(item => {
        if (item.timestamp) {
            heightMap.set(item.timestamp, item.value);
        }
    });
    
    // Get all unique timestamps and sort them
    const allTimestamps = new Set([...baseMap.keys(), ...heightMap.keys()]);
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Find gaps and fill them
    const result = [];
    const metersToFeet = 3.28084;
    let idCounter = 0;
    
    for (let i = 0; i < sortedTimestamps.length - 1; i++) {
        const currentTimestamp = sortedTimestamps[i];
        const nextTimestamp = sortedTimestamps[i + 1];
        
        // Add current timestamp data
        const baseMeters = baseMap.get(currentTimestamp);
        const heightMeters = heightMap.get(currentTimestamp);
        
        result.push({
            id: idCounter++,
            timestamp: currentTimestamp,
            base: baseMeters !== null && baseMeters !== undefined ? 
                  Math.round(baseMeters * metersToFeet) : 0,
            height: heightMeters !== null && heightMeters !== undefined ? 
                    Math.round(heightMeters * metersToFeet) : 0
        });
        
        // Calculate gap and fill with zeros
        const currentTime = new Date(currentTimestamp);
        const nextTime = new Date(nextTimestamp);
        const timeDiffMs = nextTime.getTime() - currentTime.getTime();
        const expectedInterval = 30000; // 30 seconds in milliseconds
        
        if (timeDiffMs > expectedInterval) {
            // Calculate how many 30-second intervals are missing
            const missingIntervals = Math.floor(timeDiffMs / expectedInterval) - 1;
            
            for (let j = 1; j <= missingIntervals; j++) {
                const missingTime = new Date(currentTime.getTime() + (j * expectedInterval));
                const missingTimestamp = missingTime.toISOString().replace('Z', '+00:00');
                
                result.push({
                    id: idCounter++,
                    timestamp: missingTimestamp,
                    base: 0,
                    height: 0
                });
            }
        }
    }
    
    // Add the last timestamp
    if (sortedTimestamps.length > 0) {
        const lastTimestamp = sortedTimestamps[sortedTimestamps.length - 1];
        const baseMeters = baseMap.get(lastTimestamp);
        const heightMeters = heightMap.get(lastTimestamp);
        
        result.push({
            id: idCounter++,
            timestamp: lastTimestamp,
            base: baseMeters !== null && baseMeters !== undefined ? 
                  Math.round(baseMeters * metersToFeet) : 0,
            height: heightMeters !== null && heightMeters !== undefined ? 
                    Math.round(heightMeters * metersToFeet) : 0
        });
    }
    
    return result;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cloudsTrendUrl = process.env.CLOUDS_TREND_URL || "";
  const token = process.env.MINIMET_TOKEN || "";

  // Prepare dates
  const now = new Date();
  const twentyMinutesAgo = new Date(now.getTime() - 40 * 60 * 1000);
  const endTime = now.toISOString();
  const startTime = twentyMinutesAgo.toISOString();

  const cloudsTrendPayload = {
    $type: "Miros.Models.QueryRawTrendFor, Miros.Repository.Models",
    tagIds: [258, 259],
    range: {
      $type: "Miros.Models.TimeRange, Miros.Repository.Models",
      minimum: startTime,
      maximum: endTime,
    },
    historyDirection: 0,
    interpolate: false,
    includeBefore: false,
    includeAfter: false,
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  fetch(cloudsTrendUrl, {
    headers,
    method: "POST",
    body: JSON.stringify(cloudsTrendPayload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      res.status(200).json(processWeatherData(data));
    })
    .catch((error) => {
      console.error("Error fetching clouds trend data:", error);
      res.status(500).json({ error: "Failed to fetch clouds trend data" });
    });
}
