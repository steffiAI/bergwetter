// Saves one compact snapshot of the SLF avalanche bulletin per day, for the history strip in the app.
import { readFile, writeFile } from "node:fs/promises";

const FILE = "verlauf/lawinen.json", KEEP_DAYS = 14;
const LEVEL = { low: 1, moderate: 2, considerable: 3, high: 4, very_high: 5 }, SIGN = { minus: "-", neutral: "", plus: "+" };

const response = await fetch("https://aws.slf.ch/api/bulletin/caaml/en/geojson");
if (!response.ok) throw new Error("SLF bulletin: HTTP " + response.status);
const features = (await response.json()).features || [];
if (!features.length) { console.log("No active bulletin, nothing saved."); process.exit(0); }

// Coordinates rounded to two decimals (about 1 km) keep the file small.
const thin = ring => {
  const points = [];
  for (const point of ring) {
    const rounded = [Math.round(point[0] * 100) / 100, Math.round(point[1] * 100) / 100], last = points[points.length - 1];
    if (!last || last[0] !== rounded[0] || last[1] !== rounded[1]) points.push(rounded);
  }
  return points;
};
const zones = features.map(feature => {
  const props = feature.properties || {}, geometry = feature.geometry || {};
  const top = (props.dangerRatings || []).reduce((best, rating) => (LEVEL[rating.mainValue] || 0) > (best ? LEVEL[best.mainValue] || 0 : 0) ? rating : best, null);
  const polygons = geometry.type === "MultiPolygon" ? geometry.coordinates : geometry.type === "Polygon" ? [geometry.coordinates] : [];
  return {
    level: top ? LEVEL[top.mainValue] || null : null,
    sign: top ? SIGN[top.customData && top.customData.CH && top.customData.CH.subdivision] || "" : "",
    problems: (props.avalancheProblems || []).map(item => item.problemType).filter(Boolean),
    polys: polygons.map(polygon => polygon.map(thin).filter(ring => ring.length >= 4)).filter(polygon => polygon.length)
  };
}).filter(zone => zone.level && zone.polys.length);

const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zurich" }).format(new Date());
let saved = { days: [] };
try { saved = JSON.parse(await readFile(FILE, "utf8")); } catch (error) { /* first run */ }
const days = (saved.days || []).filter(day => day.date !== date).concat({ date, zones }).sort((a, b) => a.date.localeCompare(b.date)).slice(-KEEP_DAYS);
await writeFile(FILE, JSON.stringify({ days }));
console.log("Saved " + zones.length + " zones for " + date + ", " + days.length + " days in total.");
