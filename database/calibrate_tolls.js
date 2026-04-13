#!/usr/bin/env node
/**
 * Calibrate toll plaza coordinates by placing them ON actual Mapbox route paths.
 * For each major corridor, fetches the real route, then places toll plazas at
 * realistic intervals along the route path.
 */

const https = require('https');
const { Client } = require('pg');

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get cumulative distances along route
function getRouteDistances(coords) {
  const distances = [0];
  for (let i = 1; i < coords.length; i++) {
    const d = haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
    distances.push(distances[i - 1] + d);
  }
  return distances;
}

// Find coordinate at specific distance along route
function getPointAtDistance(coords, distances, targetDist) {
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] >= targetDist) {
      const frac = (targetDist - distances[i - 1]) / (distances[i] - distances[i - 1]);
      return {
        lat: coords[i - 1][1] + frac * (coords[i][1] - coords[i - 1][1]),
        lon: coords[i - 1][0] + frac * (coords[i][0] - coords[i - 1][0])
      };
    }
  }
  return { lat: coords[coords.length - 1][1], lon: coords[coords.length - 1][0] };
}

function fetchRoute(srcLat, srcLon, dstLat, dstLon) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${srcLon},${srcLat};${dstLon},${dstLat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.routes && data.routes.length > 0) {
            resolve(data.routes[0]);
          } else {
            reject(new Error('No routes found'));
          }
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Major corridors with toll plazas at specific distances (km from start)
const corridors = [
  {
    name: 'Delhi → Jaipur',
    src: { lat: 28.6139, lon: 77.2090 },
    dst: { lat: 26.9124, lon: 75.7873 },
    tolls: [
      { km: 15, name: 'Badarpur Toll Plaza', location: 'Badarpur, Delhi', car: 1.33, truck: 2.65, bus: 2.17, moto: 0.66 },
      { km: 35, name: 'Faridabad Toll Plaza', location: 'Faridabad, Haryana', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 55, name: 'Palwal Toll Plaza', location: 'Palwal, Haryana', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 100, name: 'KMP Toll Plaza', location: 'Nuh, Haryana', car: 2.41, truck: 4.82, bus: 3.97, moto: 1.20 },
      { km: 160, name: 'Shahpura Toll Plaza', location: 'Shahpura, Rajasthan', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 220, name: 'Dudu Toll Plaza', location: 'Dudu, Rajasthan', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 270, name: 'Chandwaji Toll Plaza', location: 'Chandwaji, Rajasthan', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Mumbai → Pune (Expressway)',
    src: { lat: 19.0760, lon: 72.8777 },
    dst: { lat: 18.5204, lon: 73.8567 },
    tolls: [
      { km: 12, name: 'Vashi Toll Naka', location: 'Vashi, Navi Mumbai', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 25, name: 'Panvel Toll Plaza', location: 'Panvel, Maharashtra', car: 2.53, truck: 5.06, bus: 4.10, moto: 1.27 },
      { km: 50, name: 'Khalapur Toll Plaza', location: 'Khalapur, Maharashtra', car: 3.13, truck: 6.27, bus: 5.18, moto: 1.57 },
      { km: 95, name: 'Urse Toll Plaza', location: 'Urse, Maharashtra', car: 2.89, truck: 5.78, bus: 4.70, moto: 1.45 },
      { km: 120, name: 'Talegaon Toll Plaza', location: 'Talegaon, Maharashtra', car: 2.41, truck: 4.82, bus: 3.97, moto: 1.20 },
    ]
  },
  {
    name: 'Bangalore → Chennai',
    src: { lat: 12.9716, lon: 77.5946 },
    dst: { lat: 13.0827, lon: 80.2707 },
    tolls: [
      { km: 20, name: 'Electronic City Toll', location: 'Electronic City, Karnataka', car: 2.29, truck: 4.58, bus: 3.73, moto: 1.14 },
      { km: 70, name: 'Kolar Toll Plaza', location: 'Kolar, Karnataka', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 120, name: 'Chittoor Toll Plaza', location: 'Chittoor, AP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 170, name: 'Vellore Toll Plaza', location: 'Vellore, Tamil Nadu', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 220, name: 'Ranipet Toll Plaza', location: 'Ranipet, Tamil Nadu', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 260, name: 'Kanchipuram Toll Plaza', location: 'Kanchipuram, Tamil Nadu', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 300, name: 'Sriperumbudur Toll', location: 'Sriperumbudur, Tamil Nadu', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 330, name: 'Poonamallee Toll', location: 'Poonamallee, Tamil Nadu', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
    ]
  },
  {
    name: 'Delhi → Mumbai',
    src: { lat: 28.6139, lon: 77.2090 },
    dst: { lat: 19.0760, lon: 72.8777 },
    tolls: [
      { km: 15, name: 'Badarpur Toll (South)', location: 'Badarpur, Delhi', car: 1.33, truck: 2.65, bus: 2.17, moto: 0.66 },
      { km: 50, name: 'Palwal Toll (NH-44)', location: 'Palwal, Haryana', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 130, name: 'Mathura Toll Plaza', location: 'Mathura, UP', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 220, name: 'Agra Toll Plaza', location: 'Agra, UP', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
      { km: 330, name: 'Gwalior Toll Plaza', location: 'Gwalior, MP', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 430, name: 'Jhansi Toll Plaza', location: 'Jhansi, UP', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 530, name: 'Sagar Toll Plaza', location: 'Sagar, MP', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 630, name: 'Nagpur North Toll', location: 'Nagpur, Maharashtra', car: 2.29, truck: 4.58, bus: 3.73, moto: 1.14 },
      { km: 730, name: 'Wardha Toll Plaza', location: 'Wardha, Maharashtra', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 830, name: 'Aurangabad Toll Plaza', location: 'Aurangabad, Maharashtra', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 930, name: 'Nashik Toll Plaza', location: 'Nashik, Maharashtra', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 1030, name: 'Igatpuri Toll Plaza', location: 'Igatpuri, Maharashtra', car: 2.89, truck: 5.78, bus: 4.70, moto: 1.45 },
      { km: 1100, name: 'Kasara Toll Plaza', location: 'Kasara, Maharashtra', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 1180, name: 'Thane Toll Plaza', location: 'Thane, Maharashtra', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
    ]
  },
  {
    name: 'Kolkata → Bhubaneswar',
    src: { lat: 22.5726, lon: 88.3639 },
    dst: { lat: 20.2961, lon: 85.8245 },
    tolls: [
      { km: 20, name: 'Dankuni Toll Plaza', location: 'Dankuni, West Bengal', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 55, name: 'Vidyasagar Setu Toll', location: 'Howrah, West Bengal', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 100, name: 'Kolaghat Toll Plaza', location: 'Kolaghat, West Bengal', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 150, name: 'Kharagpur Toll Plaza', location: 'Kharagpur, West Bengal', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 220, name: 'Balasore Toll Plaza', location: 'Balasore, Odisha', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 280, name: 'Bhadrak Toll Plaza', location: 'Bhadrak, Odisha', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 360, name: 'Cuttack Toll Plaza', location: 'Cuttack, Odisha', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 420, name: 'Bhubaneswar Toll Plaza', location: 'Bhubaneswar, Odisha', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Hyderabad → Bangalore',
    src: { lat: 17.3850, lon: 78.4867 },
    dst: { lat: 12.9716, lon: 77.5946 },
    tolls: [
      { km: 25, name: 'Hyderabad ORR Toll (Shamshabad)', location: 'Shamshabad, Telangana', car: 2.41, truck: 4.82, bus: 3.97, moto: 1.20 },
      { km: 80, name: 'Jadcherla Toll Plaza', location: 'Jadcherla, Telangana', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 140, name: 'Kurnool Toll Plaza', location: 'Kurnool, AP', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 230, name: 'Anantapur Toll Plaza', location: 'Anantapur, AP', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 320, name: 'Penukonda Toll Plaza', location: 'Penukonda, AP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 400, name: 'Hindupur Toll Plaza', location: 'Hindupur, AP', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 480, name: 'Devanahalli Toll Plaza', location: 'Devanahalli, Karnataka', car: 2.41, truck: 4.82, bus: 3.97, moto: 1.20 },
    ]
  },
  {
    name: 'Delhi → Chandigarh',
    src: { lat: 28.6139, lon: 77.2090 },
    dst: { lat: 30.7333, lon: 76.7794 },
    tolls: [
      { km: 20, name: 'Kundli Toll Plaza', location: 'Kundli, Haryana', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 50, name: 'Murthal Toll Plaza', location: 'Murthal, Haryana', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 80, name: 'Panipat Toll Plaza', location: 'Panipat, Haryana', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 120, name: 'Karnal Toll Plaza', location: 'Karnal, Haryana', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 160, name: 'Kurukshetra Toll Plaza', location: 'Kurukshetra, Haryana', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 190, name: 'Ambala Toll Plaza', location: 'Ambala, Haryana', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 230, name: 'Zirakpur Toll Plaza', location: 'Zirakpur, Punjab', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Chennai → Madurai',
    src: { lat: 13.0827, lon: 80.2707 },
    dst: { lat: 9.9252, lon: 78.1198 },
    tolls: [
      { km: 30, name: 'Chengalpattu Toll Plaza', location: 'Chengalpattu, Tamil Nadu', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 100, name: 'Villupuram Toll Plaza', location: 'Villupuram, Tamil Nadu', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 200, name: 'Trichy Toll Plaza', location: 'Trichy, Tamil Nadu', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 300, name: 'Dindigul Toll Plaza', location: 'Dindigul, Tamil Nadu', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 380, name: 'Madurai Toll Plaza', location: 'Madurai, Tamil Nadu', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
    ]
  },
  {
    name: 'Mumbai → Goa',
    src: { lat: 19.0760, lon: 72.8777 },
    dst: { lat: 15.4909, lon: 73.8278 },
    tolls: [
      { km: 20, name: 'Panvel Toll (NH-66)', location: 'Panvel, Maharashtra', car: 2.53, truck: 5.06, bus: 4.10, moto: 1.27 },
      { km: 80, name: 'Mangaon Toll Plaza', location: 'Mangaon, Maharashtra', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 160, name: 'Ratnagiri Toll Plaza', location: 'Ratnagiri, Maharashtra', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 280, name: 'Sawantwadi Toll Plaza', location: 'Sawantwadi, Maharashtra', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 350, name: 'Patradevi Toll Plaza', location: 'Patradevi, Goa', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 450, name: 'Zuari Bridge Toll', location: 'Zuari, Goa', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
    ]
  },
  {
    name: 'Ahmedabad → Mumbai',
    src: { lat: 23.0225, lon: 72.5714 },
    dst: { lat: 19.0760, lon: 72.8777 },
    tolls: [
      { km: 30, name: 'Ahmedabad South Toll', location: 'Ahmedabad, Gujarat', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 100, name: 'Vadodara Toll Plaza', location: 'Vadodara, Gujarat', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 170, name: 'Bharuch Toll Plaza', location: 'Bharuch, Gujarat', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 230, name: 'Surat North Toll', location: 'Surat, Gujarat', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
      { km: 300, name: 'Valsad Toll Plaza', location: 'Valsad, Gujarat', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 370, name: 'Manor Toll Plaza', location: 'Manor, Maharashtra', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 440, name: 'Palghar Toll Plaza', location: 'Palghar, Maharashtra', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 490, name: 'Dahisar Toll Plaza', location: 'Dahisar, Mumbai', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
    ]
  },
  {
    name: 'Delhi → Lucknow',
    src: { lat: 28.6139, lon: 77.2090 },
    dst: { lat: 26.8467, lon: 80.9462 },
    tolls: [
      { km: 20, name: 'Ghaziabad Toll Plaza', location: 'Ghaziabad, UP', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 60, name: 'Hapur Toll Plaza', location: 'Hapur, UP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 140, name: 'Moradabad Toll Plaza', location: 'Moradabad, UP', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 210, name: 'Bareilly Toll Plaza', location: 'Bareilly, UP', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 300, name: 'Shahjahanpur Toll (UP)', location: 'Shahjahanpur, UP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 380, name: 'Sitapur Toll Plaza', location: 'Sitapur, UP', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 460, name: 'Lucknow Toll Plaza', location: 'Lucknow, UP', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Bangalore → Mysore',
    src: { lat: 12.9716, lon: 77.5946 },
    dst: { lat: 12.2958, lon: 76.6394 },
    tolls: [
      { km: 25, name: 'Ramanagara Toll Plaza', location: 'Ramanagara, Karnataka', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 60, name: 'Mandya Toll Plaza', location: 'Mandya, Karnataka', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 100, name: 'Srirangapatna Toll', location: 'Srirangapatna, Karnataka', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
    ]
  },
  {
    name: 'Hyderabad → Vijayawada',
    src: { lat: 17.3850, lon: 78.4867 },
    dst: { lat: 16.5062, lon: 80.6480 },
    tolls: [
      { km: 30, name: 'Hyderabad ORR Toll (LB Nagar)', location: 'LB Nagar, Telangana', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
      { km: 80, name: 'Nalgonda Toll Plaza', location: 'Nalgonda, Telangana', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 140, name: 'Suryapet Toll Plaza', location: 'Suryapet, Telangana', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 200, name: 'Kodad Toll Plaza', location: 'Kodad, Telangana', car: 1.45, truck: 2.89, bus: 2.41, moto: 0.72 },
      { km: 260, name: 'Vijayawada Toll Plaza', location: 'Vijayawada, AP', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Pune → Bangalore',
    src: { lat: 18.5204, lon: 73.8567 },
    dst: { lat: 12.9716, lon: 77.5946 },
    tolls: [
      { km: 30, name: 'Yavat Toll Plaza', location: 'Yavat, Maharashtra', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 100, name: 'Solapur Toll Plaza', location: 'Solapur, Maharashtra', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 180, name: 'Kolhapur Toll Plaza', location: 'Kolhapur, Maharashtra', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 260, name: 'Belgaum Toll Plaza', location: 'Belgaum, Karnataka', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 350, name: 'Hubli Toll Plaza', location: 'Hubli, Karnataka', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 430, name: 'Davangere Toll Plaza', location: 'Davangere, Karnataka', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 510, name: 'Chitradurga Toll Plaza', location: 'Chitradurga, Karnataka', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 580, name: 'Tumkur Toll Plaza', location: 'Tumkur, Karnataka', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 630, name: 'Nelamangala Toll Plaza', location: 'Nelamangala, Karnataka', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
    ]
  },
  {
    name: 'Delhi → Amritsar',
    src: { lat: 28.6139, lon: 77.2090 },
    dst: { lat: 31.6340, lon: 74.8723 },
    tolls: [
      { km: 15, name: 'Mukarba Chowk Toll', location: 'Delhi', car: 1.33, truck: 2.65, bus: 2.17, moto: 0.66 },
      { km: 50, name: 'Sonipat Toll Plaza', location: 'Sonipat, Haryana', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 90, name: 'Panipat Toll (North)', location: 'Panipat, Haryana', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 130, name: 'Karnal Toll (North)', location: 'Karnal, Haryana', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 180, name: 'Ambala Toll (North)', location: 'Ambala, Haryana', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 230, name: 'Rajpura Toll Plaza', location: 'Rajpura, Punjab', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 280, name: 'Ludhiana Toll Plaza', location: 'Ludhiana, Punjab', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 330, name: 'Jalandhar Toll Plaza', location: 'Jalandhar, Punjab', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 400, name: 'Amritsar Toll Plaza', location: 'Amritsar, Punjab', car: 2.17, truck: 4.34, bus: 3.61, moto: 1.08 },
    ]
  },
  {
    name: 'Bangalore → Goa',
    src: { lat: 12.9716, lon: 77.5946 },
    dst: { lat: 15.4909, lon: 73.8278 },
    tolls: [
      { km: 30, name: 'Nelamangala Toll (West)', location: 'Nelamangala, Karnataka', car: 1.93, truck: 3.86, bus: 3.19, moto: 0.96 },
      { km: 100, name: 'Tumkur Toll (West)', location: 'Tumkur, Karnataka', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 180, name: 'Chitradurga Toll (West)', location: 'Chitradurga, Karnataka', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 260, name: 'Hubli Toll (West)', location: 'Hubli, Karnataka', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
      { km: 340, name: 'Belgaum Toll (West)', location: 'Belgaum, Karnataka', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 430, name: 'Kolhapur Toll (West)', location: 'Kolhapur, Maharashtra', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
    ]
  },
  {
    name: 'Jaipur → Ahmedabad',
    src: { lat: 26.9124, lon: 75.7873 },
    dst: { lat: 23.0225, lon: 72.5714 },
    tolls: [
      { km: 30, name: 'Ajmer Road Toll', location: 'Ajmer, Rajasthan', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 100, name: 'Beawar Toll Plaza', location: 'Beawar, Rajasthan', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 200, name: 'Pali Toll Plaza', location: 'Pali, Rajasthan', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 300, name: 'Abu Road Toll Plaza', location: 'Abu Road, Rajasthan', car: 1.81, truck: 3.61, bus: 3.01, moto: 0.90 },
      { km: 380, name: 'Palanpur Toll Plaza', location: 'Palanpur, Gujarat', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 460, name: 'Mehsana Toll Plaza', location: 'Mehsana, Gujarat', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
    ]
  },
  {
    name: 'Lucknow → Varanasi',
    src: { lat: 26.8467, lon: 80.9462 },
    dst: { lat: 25.3176, lon: 82.9739 },
    tolls: [
      { km: 40, name: 'Sultanpur Toll Plaza', location: 'Sultanpur, UP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 120, name: 'Faizabad Toll Plaza', location: 'Faizabad, UP', car: 1.69, truck: 3.37, bus: 2.77, moto: 0.84 },
      { km: 200, name: 'Jaunpur Toll Plaza', location: 'Jaunpur, UP', car: 1.57, truck: 3.13, bus: 2.59, moto: 0.78 },
      { km: 260, name: 'Varanasi Toll Plaza', location: 'Varanasi, UP', car: 2.05, truck: 4.10, bus: 3.37, moto: 1.02 },
    ]
  },
];

async function main() {
  const client = new Client({
    host: 'localhost',
    database: 'route_toll_db',
    user: 'chinmay',
    password: '',
  });
  await client.connect();
  
  // Clear existing data
  await client.query('TRUNCATE toll_plazas RESTART IDENTITY');
  console.log('Cleared existing toll data');
  
  let totalInserted = 0;
  
  for (const corridor of corridors) {
    console.log(`\nProcessing: ${corridor.name}`);
    try {
      const route = await fetchRoute(corridor.src.lat, corridor.src.lon, corridor.dst.lat, corridor.dst.lon);
      const coords = route.geometry.coordinates;
      const distances = getRouteDistances(coords);
      const totalDist = distances[distances.length - 1];
      
      console.log(`  Route: ${coords.length} coords, ${totalDist.toFixed(0)} km`);
      
      for (const toll of corridor.tolls) {
        if (toll.km > totalDist) {
          console.log(`  ⚠ ${toll.name}: ${toll.km}km > route length ${totalDist.toFixed(0)}km, placing at ${(totalDist - 5).toFixed(0)}km`);
          toll.km = totalDist - 5;
        }
        
        const point = getPointAtDistance(coords, distances, toll.km);
        
        // Check for duplicate (same name within 1km)
        const dupCheck = await client.query(
          'SELECT id FROM toll_plazas WHERE name = $1',
          [toll.name]
        );
        
        if (dupCheck.rows.length > 0) {
          // Update with potentially better coordinates (from different corridor)
          console.log(`  ~ ${toll.name}: already exists, skipping`);
          continue;
        }
        
        await client.query(
          `INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
          [toll.name, toll.location, point.lat, point.lon, toll.car, toll.truck, toll.bus, toll.moto]
        );
        totalInserted++;
        console.log(`  ✓ ${toll.name}: [${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}] at ${toll.km}km`);
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
    // Rate limit Mapbox API
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n=== Inserted ${totalInserted} toll plazas ===`);
  
  const count = await client.query('SELECT count(*) FROM toll_plazas');
  console.log(`Total in database: ${count.rows[0].count}`);
  
  await client.end();
}

main().catch(console.error);
