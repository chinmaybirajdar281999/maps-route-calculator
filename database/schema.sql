CREATE TABLE toll_plazas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  car_charge DECIMAL(10, 2) DEFAULT 0,
  truck_charge DECIMAL(10, 2) DEFAULT 0,
  bus_charge DECIMAL(10, 2) DEFAULT 0,
  motorcycle_charge DECIMAL(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_toll_location ON toll_plazas (latitude, longitude);
CREATE INDEX idx_toll_active ON toll_plazas (active);

-- Sample data
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge) VALUES
('Mumbai-Pune Expressway Toll', 'Khalapur', 18.8372, 73.1933, 2.50, 5.00),
('Bandra-Worli Sea Link Toll', 'Bandra', 19.0355, 72.8195, 3.75, 7.50),
('Delhi-Jaipur Expressway Toll', 'Neemrana', 27.8760, 76.5443, 2.30, 4.60),
('Alwar Toll Plaza', 'Alwar', 27.6159, 76.6980, 1.80, 3.60),
('Dausa Toll Plaza', 'Dausa', 26.8776, 76.5188, 1.50, 3.00),
('Hosur Toll Plaza', 'Hosur', 12.7343, 77.8258, 1.75, 3.50),
('Anantapur Toll Plaza', 'Anantapur', 14.6810, 77.6003, 2.10, 4.20),
('Kurnool Toll Plaza', 'Kurnool', 15.8299, 78.0373, 2.40, 4.80),
('Hyderabad ORR Toll Plaza', 'Hyderabad', 17.4687, 78.3910, 1.95, 3.90),
('Neemrana Highway Toll', 'Neemrana', 27.6122, 76.9534, 2.40, 4.80),
('Dausa Highway Toll', 'Dausa', 26.9796, 76.5319, 1.65, 3.30),
('Panvel Toll Plaza', 'Panvel', 18.9833, 73.1100, 2.00, 4.00),
('Ratnagiri Toll Plaza', 'Ratnagiri', 16.9900, 73.3070, 2.20, 4.40),
('Krishnagiri Toll Plaza', 'Krishnagiri', 12.5195, 78.2136, 2.10, 4.20);