const {
  haversineDistance,
  getDistanceFromPointToLineSegment,
  getMinDistanceToRoute,
  getTollCharge,
} = require('../services/tollService');

describe('haversineDistance', () => {
  test('same point returns 0', () => {
    expect(haversineDistance(28.6, 77.2, 28.6, 77.2)).toBe(0);
  });

  test('Delhi to Jaipur ≈ 240-260 km', () => {
    const d = haversineDistance(28.6139, 77.209, 26.9124, 75.7873);
    expect(d).toBeGreaterThan(230);
    expect(d).toBeLessThan(270);
  });

  test('short distance is accurate', () => {
    // ~1.11 km per 0.01 degree latitude
    const d = haversineDistance(28.0, 77.0, 28.01, 77.0);
    expect(d).toBeCloseTo(1.11, 1);
  });

  test('distance is symmetric', () => {
    const d1 = haversineDistance(19.076, 72.8777, 28.6139, 77.209);
    const d2 = haversineDistance(28.6139, 77.209, 19.076, 72.8777);
    expect(d1).toBeCloseTo(d2, 10);
  });
});

describe('getDistanceFromPointToLineSegment', () => {
  test('point on the segment returns ~0', () => {
    const d = getDistanceFromPointToLineSegment(28.5, 77.0, [28.0, 77.0], [29.0, 77.0]);
    expect(d).toBeLessThan(0.1); // essentially on the line
  });

  test('point perpendicular to segment', () => {
    // Point is 0.01° east of a north-south segment at lat 28
    const d = getDistanceFromPointToLineSegment(28.5, 77.01, [28.0, 77.0], [29.0, 77.0]);
    expect(d).toBeGreaterThan(0.5);
    expect(d).toBeLessThan(2);
  });

  test('point nearest to segment start (projection < 0)', () => {
    // Point is south of the segment
    const d = getDistanceFromPointToLineSegment(27.0, 77.0, [28.0, 77.0], [29.0, 77.0]);
    // Should equal haversine distance to segment start
    const expected = haversineDistance(27.0, 77.0, 28.0, 77.0);
    expect(d).toBeCloseTo(expected, 5);
  });

  test('point nearest to segment end (projection > 1)', () => {
    const d = getDistanceFromPointToLineSegment(30.0, 77.0, [28.0, 77.0], [29.0, 77.0]);
    const expected = haversineDistance(30.0, 77.0, 29.0, 77.0);
    expect(d).toBeCloseTo(expected, 5);
  });
});

describe('getMinDistanceToRoute', () => {
  test('toll on route returns very small distance', () => {
    // Route: [lng, lat] pairs along 77.0 longitude from lat 28 to 29
    const route = [
      [77.0, 28.0],
      [77.0, 28.5],
      [77.0, 29.0],
    ];
    const d = getMinDistanceToRoute(28.25, 77.0, route);
    expect(d).toBeLessThan(0.1);
  });

  test('toll 10km from route returns ~10', () => {
    const route = [
      [77.0, 28.0],
      [77.0, 29.0],
    ];
    // ~0.1° longitude ≈ 10km at lat 28
    const d = getMinDistanceToRoute(28.5, 77.1, route);
    expect(d).toBeGreaterThan(8);
    expect(d).toBeLessThan(12);
  });

  test('picks closest segment', () => {
    const route = [
      [77.0, 28.0],
      [77.0, 28.5],
      [77.5, 28.5], // turns east
    ];
    // Point near the second segment
    const d = getMinDistanceToRoute(28.5, 77.25, route);
    expect(d).toBeLessThan(4);
  });
});

describe('getTollCharge', () => {
  const toll = {
    car_charge: '2.50',
    truck_charge: '5.00',
    bus_charge: '4.00',
    motorcycle_charge: '1.00',
  };

  test('returns car charge', () => {
    expect(getTollCharge(toll, 'car')).toBe(2.5);
  });

  test('returns truck charge', () => {
    expect(getTollCharge(toll, 'truck')).toBe(5.0);
  });

  test('returns bus charge', () => {
    expect(getTollCharge(toll, 'bus')).toBe(4.0);
  });

  test('returns motorcycle charge', () => {
    expect(getTollCharge(toll, 'motorcycle')).toBe(1.0);
  });

  test('unknown vehicle falls back to car', () => {
    expect(getTollCharge(toll, 'van')).toBe(2.5);
  });

  test('handles null charges gracefully', () => {
    const t = { car_charge: null, truck_charge: null, bus_charge: null, motorcycle_charge: null };
    expect(getTollCharge(t, 'car')).toBe(0);
  });
});
