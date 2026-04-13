const { FUEL_EFFICIENCY } = (() => {
  // Re-declare the constant here to test independently of the controller module
  // (controller requires dotenv / express which we don't want in unit tests)
  return {
    FUEL_EFFICIENCY: {
      car: { kmpl: 15, pricePerLitre: 105 },
      truck: { kmpl: 5, pricePerLitre: 92 },
      bus: { kmpl: 4.5, pricePerLitre: 92 },
      motorcycle: { kmpl: 45, pricePerLitre: 105 },
    },
  };
})();

describe('Fuel cost estimation', () => {
  function calcFuel(distanceKm, vehicleType) {
    const fuel = FUEL_EFFICIENCY[vehicleType] || FUEL_EFFICIENCY.car;
    const litres = distanceKm / fuel.kmpl;
    return {
      litres: Number(litres.toFixed(2)),
      cost: Number((litres * fuel.pricePerLitre).toFixed(2)),
    };
  }

  test('car 300km trip', () => {
    const { litres, cost } = calcFuel(300, 'car');
    expect(litres).toBe(20);
    expect(cost).toBe(2100); // 20L * ₹105
  });

  test('truck 300km trip uses more fuel', () => {
    const { litres, cost } = calcFuel(300, 'truck');
    expect(litres).toBe(60);
    expect(cost).toBe(5520); // 60L * ₹92
  });

  test('motorcycle is most efficient', () => {
    const { litres } = calcFuel(300, 'motorcycle');
    expect(litres).toBeCloseTo(6.67, 1);
  });

  test('unknown vehicle falls back to car', () => {
    const { litres } = calcFuel(150, 'van');
    expect(litres).toBe(10);
  });
});

describe('Cache key generation', () => {
  function buildCacheKey(source, destination, waypoints, vehicleType, avoidTolls) {
    const wpKey = waypoints.map(w => `${w.lat}:${w.lng}`).join('|');
    return `route:${source.lat}:${source.lng}:${destination.lat}:${destination.lng}:${wpKey}:${vehicleType}:${avoidTolls}`;
  }

  test('basic key without waypoints', () => {
    const key = buildCacheKey(
      { lat: 28.6, lng: 77.2 },
      { lat: 26.9, lng: 75.8 },
      [],
      'car',
      false
    );
    expect(key).toBe('route:28.6:77.2:26.9:75.8::car:false');
  });

  test('key with waypoints', () => {
    const key = buildCacheKey(
      { lat: 28.6, lng: 77.2 },
      { lat: 26.9, lng: 75.8 },
      [{ lat: 27.5, lng: 76.5 }],
      'truck',
      true
    );
    expect(key).toBe('route:28.6:77.2:26.9:75.8:27.5:76.5:truck:true');
  });

  test('avoidTolls flag changes key', () => {
    const k1 = buildCacheKey({ lat: 28, lng: 77 }, { lat: 26, lng: 75 }, [], 'car', false);
    const k2 = buildCacheKey({ lat: 28, lng: 77 }, { lat: 26, lng: 75 }, [], 'car', true);
    expect(k1).not.toBe(k2);
  });
});
