// Collects the avalanche bulletins of the Alpine warning services outside Switzerland into one file for the app.
// Bulletins: CAAML v6 files published by the Euregio avalanche report for all EAWS services. Outlines: EAWS micro-regions.
import { writeFile } from "node:fs/promises";

const FILE = "verlauf/alpen.json", LOG = "verlauf/alpen-log.json";
const REGIONS = ["AT-02", "AT-03", "AT-04", "AT-05", "AT-06", "AT-07", "AT-08", "DE-BY", "IT-32-BZ", "IT-32-TN", "IT-21", "IT-23", "IT-25", "IT-34", "IT-36", "SI"];
const bulletinUrls = (region, date) => ["https://static.avalanche.report/eaws_bulletins/" + date + "/" + date + "-" + region + ".json"];
const outlineUrls = region => [
  "https://regions.avalanches.org/micro-regions/" + region + "_micro-regions.geojson.json",
  "https://gitlab.com/eaws/eaws-regions/-/raw/master/public/micro-regions/" + region + "_micro-regions.geojson.json"
];

async function firstJson(urls) {
  let problem = "";
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (response.ok) return { json: await response.json(), url };
      problem = "HTTP " + response.status;
    } catch (error) { problem = String(error.message || error); }
  }
  return { problem };
}
const day = offset => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Vienna" }).format(new Date(Date.now() + offset * 86400000));
// Coordinates rounded to two decimals (about 1 km) keep the file small.
const thin = ring => {
  const points = [];
  for (const point of ring) {
    const rounded = [Math.round(point[0] * 100) / 100, Math.round(point[1] * 100) / 100], last = points[points.length - 1];
    if (!last || last[0] !== rounded[0] || last[1] !== rounded[1]) points.push(rounded);
  }
  return points;
};
const polygonsOf = geometry => (geometry && geometry.type === "MultiPolygon" ? geometry.coordinates : geometry && geometry.type === "Polygon" ? [geometry.coordinates] : [])
  .map(polygon => polygon.map(thin).filter(ring => ring.length >= 4)).filter(polygon => polygon.length);

const now = Date.now(), today = day(0), features = [], log = { run: new Date().toISOString(), regions: {} };
for (const region of REGIONS) {
  const note = log.regions[region] = {};
  const outlines = await firstJson(outlineUrls(region));
  if (!outlines.json) { note.outlines = outlines.problem; continue; }
  const shapes = {};
  for (const feature of outlines.json.features || []) {
    const props = feature.properties || {};
    if ((props.end_date && props.end_date <= today) || (props.start_date && props.start_date > today)) continue;
    if (props.id) shapes[props.id] = (shapes[props.id] || []).concat(polygonsOf(feature.geometry));
  }
  note.outlines = Object.keys(shapes).length;
  // Tomorrow's bulletin appears in the late afternoon; until then today's is the current one.
  let kept = 0;
  for (const date of [day(1), today]) {
    const found = await firstJson(bulletinUrls(region, date));
    if (!found.json) { note[date] = found.problem; continue; }
    const current = (found.json.bulletins || []).filter(bulletin => {
      const end = Date.parse(bulletin.validTime && bulletin.validTime.endTime);
      return !end || end > now;
    });
    note[date] = current.length + " of " + (found.json.bulletins || []).length + " valid";
    for (const bulletin of current) {
      const polygons = (bulletin.regions || []).flatMap(item => shapes[item.regionID] || []);
      if (!polygons.length) continue;
      const provider = bulletin.source && (bulletin.source.provider || bulletin.source.person) || {};
      features.push({ type: "Feature", geometry: { type: "MultiPolygon", coordinates: polygons }, properties: {
        validTime: bulletin.validTime, dangerRatings: bulletin.dangerRatings || [], tendency: bulletin.tendency ? [].concat(bulletin.tendency).map(item => ({ tendencyType: item.tendencyType })) : [],
        avalancheProblems: (bulletin.avalancheProblems || []).map(item => ({ problemType: item.problemType, elevation: item.elevation, aspects: item.aspects })),
        source: { name: provider.name || region, website: provider.website || "" }, region } });
      kept++;
    }
    if (kept) break;
  }
  note.bulletins = kept;
}
log.features = features.length;
await writeFile(LOG, JSON.stringify(log, null, 1));
// An empty result is saved too, so expired bulletins never stay in the app.
await writeFile(FILE, JSON.stringify({ updated: log.run, type: "FeatureCollection", features }));
console.log(JSON.stringify(log, null, 1));
