#!/usr/bin/env node
/**
 * Sync toll plaza locations from OpenStreetMap Overpass API into PostgreSQL.
 *
 * - Queries barrier=toll_booth nodes across India
 * - Deduplicates against existing DB entries (500m threshold)
 * - Inserts new plazas with OSM charge data when available, else average estimates
 * - Re-run safe: will not duplicate existing entries
 *
 * Usage:  node database/sync_osm_tolls.js [--dry-run]
 */

const path = require('path');
const https = require('https');
const http = require('http');

// Resolve modules from backend/node_modules
const backendDir = path.join(__dirname, '..', 'backend');
const backendModules = path.join(backendDir, 'node_modules');
require(path.join(backendModules, 'dotenv')).config({ path: path.join(backendDir, '.env') });
const { Pool } = require(path.join(backendModules, 'pg'));

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'route_toll_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const DRY_RUN = process.argv.includes('--dry-run');

// ── Overpass queries for Indian toll booths (split into regions) ───────
// Split India into smaller bounding boxes to avoid timeouts
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const REGIONS = [
  { name: 'North India',    bbox: '26.0,73.0,37.0,82.0' },
  { name: 'Central India',  bbox: '20.0,72.0,26.0,85.0' },
  { name: 'West India',     bbox: '15.0,68.0,24.0,76.0' },
  { name: 'South India',    bbox: '6.5,73.0,20.0,81.0' },
  { name: 'East India',     bbox: '20.0,82.0,28.0,97.5' },
  { name: 'Southeast India', bbox: '6.5,78.0,20.0,97.5' },
  { name: 'Northeast India', bbox: '22.0,88.0,29.5,97.5' },
];

function buildQuery(bbox) {
  return `[out:json][timeout:90];node["barrier"="toll_booth"](${bbox});out body;`;
}

// ── Helpers ────────────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Parse OSM charge tag like "INR 155" / "₹155" / "155" → USD amount */
function parseChargeToUsd(chargeStr) {
  if (!chargeStr) return null;
  const num = parseFloat(chargeStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return null;
  // Assume INR if no currency or currency is INR/₹
  if (/USD|\$/i.test(chargeStr)) return num;
  return +(num / 83).toFixed(2); // INR → USD
}

/** Fetch URL and return body string */
function fetchUrl(url, postData) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = new URL(url);
    const reqOpts = {
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: postData ? 'POST' : 'GET',
      headers: postData
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {},
    };

    const req = mod.request(reqOpts, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString().slice(0, 200)}`));
        }
        resolve(Buffer.concat(chunks).toString());
      });
    });

    req.on('error', reject);
    req.setTimeout(180_000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) req.write(postData);
    req.end();
  });
}

// ── Average toll charges (USD) when OSM has no pricing ─────────────────
// Based on existing seed data averages for Indian NHAI tolls
const DEFAULT_CHARGES = {
  car: 1.85,
  truck: 3.70,
  bus: 3.05,
  motorcycle: 0.92,
};

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Querying OpenStreetMap Overpass API for toll booths in India...');
  console.log(`   Fetching ${REGIONS.length} regions (with pauses between requests)\n`);

  // Collect all OSM nodes from regional queries
  let allOsmNodes = [];

  for (const region of REGIONS) {
    console.log(`  ⏳ ${region.name} (${region.bbox})...`);
    const query = buildQuery(region.bbox);
    try {
      const body = await fetchUrl(OVERPASS_URL, `data=${encodeURIComponent(query)}`);
      const data = JSON.parse(body);
      const nodes = data.elements || [];
      console.log(`     ✅ ${nodes.length} toll booths`);
      allOsmNodes.push(...nodes);
    } catch (err) {
      console.warn(`     ⚠️  Failed (${err.message}) — skipping region`);
    }
    // Pause 5s between requests to respect Overpass rate limits
    if (REGIONS.indexOf(region) < REGIONS.length - 1) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Deduplicate OSM nodes themselves (regions can overlap)
  const seen = new Set();
  const osmNodes = allOsmNodes.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  console.log(`\n✅ Total unique OSM toll booth nodes: ${osmNodes.length}\n`);

  if (osmNodes.length === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  // Fetch existing toll plazas
  const { rows: existing } = await pool.query(
    'SELECT id, name, latitude, longitude FROM toll_plazas'
  );
  console.log(`📦 Existing toll plazas in DB: ${existing.length}\n`);

  const DEDUP_THRESHOLD_KM = 0.5; // 500 meters

  let inserted = 0;
  let skippedDup = 0;
  let skippedNoCoord = 0;

  for (const node of osmNodes) {
    const lat = node.lat;
    const lon = node.lon;
    if (!lat || !lon) {
      skippedNoCoord++;
      continue;
    }

    // Check if already in DB (within 500m of any existing plaza)
    const isDuplicate = existing.some(
      (e) => haversineKm(lat, lon, parseFloat(e.latitude), parseFloat(e.longitude)) < DEDUP_THRESHOLD_KM
    );
    if (isDuplicate) {
      skippedDup++;
      continue;
    }

    // Build name from OSM tags
    const tags = node.tags || {};
    const name =
      tags.name ||
      tags['name:en'] ||
      tags.description ||
      tags.operator ||
      `OSM Toll #${node.id}`;

    const location =
      tags['addr:city'] ||
      tags['addr:district'] ||
      tags['addr:state'] ||
      tags.operator ||
      '';

    // Try to extract charges from OSM tags
    const carCharge =
      parseChargeToUsd(tags['charge:car'] || tags['charge:motorcar'] || tags.charge || tags.fee) ??
      DEFAULT_CHARGES.car;
    const truckCharge =
      parseChargeToUsd(tags['charge:hgv'] || tags['charge:truck']) ?? DEFAULT_CHARGES.truck;
    const busCharge =
      parseChargeToUsd(tags['charge:bus']) ?? DEFAULT_CHARGES.bus;
    const motorcycleCharge =
      parseChargeToUsd(tags['charge:motorcycle'] || tags['charge:moped']) ??
      DEFAULT_CHARGES.motorcycle;

    if (DRY_RUN) {
      console.log(`  [DRY] Would insert: ${name} (${lat.toFixed(4)}, ${lon.toFixed(4)}) — car $${carCharge}`);
    } else {
      await pool.query(
        `INSERT INTO toll_plazas
           (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
        [name, location, lat, lon, carCharge, truckCharge, busCharge, motorcycleCharge]
      );
    }

    // Add to existing list so subsequent nodes are deduped against this too
    existing.push({ id: null, name, latitude: lat, longitude: lon });
    inserted++;
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`  OSM nodes received  : ${osmNodes.length}`);
  console.log(`  Already in DB (dup) : ${skippedDup}`);
  console.log(`  No coordinates      : ${skippedNoCoord}`);
  console.log(`  ${DRY_RUN ? 'Would insert' : 'Inserted'}        : ${inserted}`);
  console.log('═══════════════════════════════════════');

  if (!DRY_RUN && inserted > 0) {
    const { rows } = await pool.query('SELECT COUNT(*) FROM toll_plazas WHERE active = true');
    console.log(`\n📊 Total active toll plazas now: ${rows[0].count}`);
  }

  await pool.end();
  console.log('\n✅ Done!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
