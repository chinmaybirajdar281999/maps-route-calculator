-- Comprehensive India Toll Plaza Data
-- Covers all major NHAI corridors and expressways
-- Charges are in USD (multiplied by 83 in backend to get INR)
-- Typical Indian tolls: Car ₹90-₹400  => $1.08 - $4.82
--                       Truck ₹180-₹800 => $2.17 - $9.64
--                       Bus ₹150-₹650   => $1.81 - $7.83
--                       Motorcycle ₹45-₹200 => $0.54 - $2.41

-- Clear existing data
TRUNCATE toll_plazas RESTART IDENTITY;

-- ════════════════════════════════════════════
-- NH-48 / NH-8: DELHI → JAIPUR → AHMEDABAD → MUMBAI
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Kherki Daula Toll', 'Gurugram, Haryana', 28.3929, 76.9948, 1.57, 3.13, 2.59, 0.78, true),
('Manesar Toll Plaza', 'Manesar, Haryana', 28.3552, 76.9367, 1.45, 2.89, 2.41, 0.72, true),
('Dharuhera Toll Plaza', 'Dharuhera, Haryana', 28.2072, 76.7974, 1.81, 3.61, 3.01, 0.90, true),
('Shahjahanpur Toll Plaza', 'Shahjahanpur, Rajasthan', 27.8910, 76.5050, 2.05, 4.10, 3.37, 1.02, true),
('Neemrana Toll Plaza', 'Neemrana, Rajasthan', 27.9862, 76.3835, 1.93, 3.86, 3.19, 0.96, true),
('Behror Toll Plaza', 'Behror, Rajasthan', 27.8885, 76.2889, 1.69, 3.37, 2.77, 0.84, true),
('Kotputli Toll Plaza', 'Kotputli, Rajasthan', 27.7027, 76.2002, 1.57, 3.13, 2.59, 0.78, true),
('Chandwaji Toll Plaza', 'Chandwaji, Rajasthan', 27.0310, 75.8592, 2.17, 4.34, 3.61, 1.08, true),
('Ajmer Toll Plaza', 'Ajmer, Rajasthan', 26.4520, 74.6399, 1.81, 3.61, 3.01, 0.90, true),
('Beawar Toll Plaza', 'Beawar, Rajasthan', 26.1009, 74.3210, 1.69, 3.37, 2.77, 0.84, true),
('Pali Toll Plaza', 'Pali, Rajasthan', 25.7706, 73.3234, 1.57, 3.13, 2.59, 0.78, true),
('Udaipur Highway Toll', 'Udaipur, Rajasthan', 24.5854, 73.7125, 1.93, 3.86, 3.19, 0.96, true),
('Abu Road Toll Plaza', 'Abu Road, Rajasthan', 24.4799, 72.7833, 1.81, 3.61, 3.01, 0.90, true),
('Palanpur Toll Plaza', 'Palanpur, Gujarat', 24.1688, 72.4268, 1.69, 3.37, 2.77, 0.84, true),
('Mehsana Toll Plaza', 'Mehsana, Gujarat', 23.5880, 72.3693, 1.57, 3.13, 2.59, 0.78, true),
('Ahmedabad North Toll', 'Ahmedabad, Gujarat', 23.1078, 72.5714, 2.05, 4.10, 3.37, 1.02, true),
('Ahmedabad-Vadodara Exp Toll', 'Nadiad, Gujarat', 22.6916, 72.8634, 2.41, 4.82, 3.97, 1.20, true),
('Vadodara Toll Plaza', 'Vadodara, Gujarat', 22.3072, 73.1812, 1.93, 3.86, 3.19, 0.96, true),
('Bharuch Toll Plaza', 'Bharuch, Gujarat', 21.6943, 72.9689, 1.81, 3.61, 3.01, 0.90, true),
('Surat North Toll', 'Surat, Gujarat', 21.2370, 72.8979, 2.17, 4.34, 3.61, 1.08, true),
('Surat South Toll', 'Surat, Gujarat', 21.1280, 72.8497, 1.69, 3.37, 2.77, 0.84, true),
('Valsad Toll Plaza', 'Valsad, Gujarat', 20.5992, 72.9342, 1.57, 3.13, 2.59, 0.78, true),
('Vapi Toll Plaza', 'Vapi, Gujarat', 20.3715, 72.9049, 1.45, 2.89, 2.41, 0.72, true),
('Manor Toll Plaza', 'Manor, Maharashtra', 19.7283, 72.8920, 2.05, 4.10, 3.37, 1.02, true),
('Charoti Toll Plaza', 'Charoti, Maharashtra', 19.8682, 72.8651, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- NH-44: DELHI → AGRA → HYDERABAD → BANGALORE → CHENNAI
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Faridabad Toll Plaza', 'Faridabad, Haryana', 28.4089, 77.3178, 1.57, 3.13, 2.59, 0.78, true),
('Palwal Toll Plaza', 'Palwal, Haryana', 28.1487, 77.3320, 1.81, 3.61, 3.01, 0.90, true),
('Mathura Toll Plaza', 'Mathura, UP', 27.4924, 77.6737, 1.93, 3.86, 3.19, 0.96, true),
('Agra Toll Plaza', 'Agra, UP', 27.1767, 78.0081, 2.17, 4.34, 3.61, 1.08, true),
('Dholpur Toll Plaza', 'Dholpur, Rajasthan', 26.6922, 77.8893, 1.69, 3.37, 2.77, 0.84, true),
('Gwalior Toll Plaza', 'Gwalior, MP', 26.2183, 78.1828, 1.81, 3.61, 3.01, 0.90, true),
('Jhansi Toll Plaza', 'Jhansi, UP', 25.4484, 78.5685, 1.93, 3.86, 3.19, 0.96, true),
('Sagar Toll Plaza', 'Sagar, MP', 23.8388, 78.7378, 1.69, 3.37, 2.77, 0.84, true),
('Narsinghpur Toll Plaza', 'Narsinghpur, MP', 22.9451, 79.1927, 1.57, 3.13, 2.59, 0.78, true),
('Nagpur North Toll', 'Nagpur, Maharashtra', 21.2514, 79.0882, 2.29, 4.58, 3.73, 1.14, true),
('Nagpur South Toll', 'Nagpur, Maharashtra', 21.0454, 79.0882, 2.05, 4.10, 3.37, 1.02, true),
('Adilabad Toll Plaza', 'Adilabad, Telangana', 19.6641, 78.5321, 1.81, 3.61, 3.01, 0.90, true),
('Nizamabad Toll Plaza', 'Nizamabad, Telangana', 18.6725, 78.0941, 1.69, 3.37, 2.77, 0.84, true),
('Hyderabad ORR Toll (Shamshabad)', 'Shamshabad, Telangana', 17.2403, 78.4294, 2.41, 4.82, 3.97, 1.20, true),
('Hyderabad ORR Toll (Gachibowli)', 'Gachibowli, Telangana', 17.4401, 78.3489, 2.29, 4.58, 3.73, 1.14, true),
('Hyderabad ORR Toll (LB Nagar)', 'LB Nagar, Telangana', 17.3457, 78.5522, 2.17, 4.34, 3.61, 1.08, true),
('Jadcherla Toll Plaza', 'Jadcherla, Telangana', 16.7633, 78.1369, 1.69, 3.37, 2.77, 0.84, true),
('Kurnool Toll Plaza', 'Kurnool, Andhra Pradesh', 15.8281, 78.0373, 1.93, 3.86, 3.19, 0.96, true),
('Anantapur Toll Plaza', 'Anantapur, AP', 14.6819, 77.6014, 1.81, 3.61, 3.01, 0.90, true),
('Penukonda Toll Plaza', 'Penukonda, AP', 14.0832, 77.5899, 1.57, 3.13, 2.59, 0.78, true),
('Hindupur Toll Plaza', 'Hindupur, AP', 13.8288, 77.4895, 1.45, 2.89, 2.41, 0.72, true),
('Devanahalli Toll Plaza', 'Devanahalli, Karnataka', 13.2468, 77.7133, 2.41, 4.82, 3.97, 1.20, true),
('Bangalore North Toll (Hebbal)', 'Hebbal, Karnataka', 13.0358, 77.5970, 2.17, 4.34, 3.61, 1.08, true),
('Electronic City Toll', 'Electronic City, Karnataka', 12.8456, 77.6603, 2.29, 4.58, 3.73, 1.14, true),
('Hosur Toll Plaza', 'Hosur, Tamil Nadu', 12.7343, 77.8258, 1.93, 3.86, 3.19, 0.96, true),
('Krishnagiri Toll Plaza', 'Krishnagiri, Tamil Nadu', 12.5195, 78.2136, 1.81, 3.61, 3.01, 0.90, true),
('Vellore Toll Plaza', 'Vellore, Tamil Nadu', 12.9165, 79.1325, 1.69, 3.37, 2.77, 0.84, true),
('Kanchipuram Toll Plaza', 'Kanchipuram, Tamil Nadu', 12.8342, 79.7036, 1.57, 3.13, 2.59, 0.78, true),
('Sriperumbudur Toll', 'Sriperumbudur, Tamil Nadu', 12.9672, 79.9437, 2.05, 4.10, 3.37, 1.02, true),
('Chennai ORR Toll (Vandalur)', 'Vandalur, Tamil Nadu', 12.8923, 80.0811, 2.17, 4.34, 3.61, 1.08, true);

-- ════════════════════════════════════════════
-- MUMBAI–PUNE EXPRESSWAY & SURROUNDING
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Khalapur Toll Plaza', 'Khalapur, Maharashtra', 18.8372, 73.1933, 3.13, 6.27, 5.18, 1.57, true),
('Bandra-Worli Sea Link Toll', 'Bandra, Mumbai', 19.0355, 72.8195, 4.82, 9.64, 7.83, 2.41, true),
('Urse Toll Plaza', 'Urse, Maharashtra', 18.7146, 73.3879, 2.89, 5.78, 4.70, 1.45, true),
('Talegaon Toll Plaza', 'Talegaon, Maharashtra', 18.7345, 73.6754, 2.41, 4.82, 3.97, 1.20, true),
('Panvel Toll Plaza', 'Panvel, Maharashtra', 18.9833, 73.1100, 2.53, 5.06, 4.10, 1.27, true),
('Dahisar Toll Plaza', 'Dahisar, Mumbai', 19.2502, 72.8545, 1.45, 2.89, 2.41, 0.72, true),
('Mulund Toll Naka', 'Mulund, Mumbai', 19.1724, 72.9569, 1.20, 2.41, 1.93, 0.60, true),
('Vashi Toll Naka', 'Vashi, Navi Mumbai', 19.0748, 72.9988, 1.45, 2.89, 2.41, 0.72, true),
('Airoli Toll Plaza', 'Airoli, Navi Mumbai', 19.1556, 72.9982, 1.33, 2.65, 2.17, 0.66, true);

-- ════════════════════════════════════════════
-- NH-19 / NH-2: DELHI → KANPUR → VARANASI → KOLKATA (via intermediate)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Badarpur Toll Plaza', 'Badarpur, Delhi', 28.5073, 77.3023, 1.33, 2.65, 2.17, 0.66, true),
('Agra-Lucknow Exp Toll (Firozabad)', 'Firozabad, UP', 27.1512, 78.3958, 2.41, 4.82, 3.97, 1.20, true),
('Agra-Lucknow Exp Toll (Etawah)', 'Etawah, UP', 26.7731, 79.0211, 2.29, 4.58, 3.73, 1.14, true),
('Kannauj Toll Plaza', 'Kannauj, UP', 27.0541, 79.9134, 1.69, 3.37, 2.77, 0.84, true),
('Kanpur Toll Plaza', 'Kanpur, UP', 26.4499, 80.3319, 2.05, 4.10, 3.37, 1.02, true),
('Lucknow Toll Plaza', 'Lucknow, UP', 26.8467, 80.9462, 2.17, 4.34, 3.61, 1.08, true),
('Sultanpur Toll Plaza', 'Sultanpur, UP', 26.2648, 82.0716, 1.57, 3.13, 2.59, 0.78, true),
('Varanasi Toll Plaza', 'Varanasi, UP', 25.3176, 82.9739, 2.05, 4.10, 3.37, 1.02, true),
('Mughal Sarai Toll', 'Mughal Sarai, UP', 25.2838, 83.1192, 1.69, 3.37, 2.77, 0.84, true),
('Sasaram Toll Plaza', 'Sasaram, Bihar', 24.9537, 84.0316, 1.57, 3.13, 2.59, 0.78, true),
('Aurangabad (Bihar) Toll', 'Aurangabad, Bihar', 24.7520, 84.3742, 1.45, 2.89, 2.41, 0.72, true),
('Dehri Toll Plaza', 'Dehri, Bihar', 24.9076, 84.1829, 1.57, 3.13, 2.59, 0.78, true),
('Durgapur Expressway Toll', 'Durgapur, West Bengal', 23.5204, 87.3119, 2.41, 4.82, 3.97, 1.20, true),
('Barddhaman Toll Plaza', 'Barddhaman, West Bengal', 23.2345, 87.8615, 1.81, 3.61, 3.01, 0.90, true),
('Singur Toll Plaza', 'Singur, West Bengal', 22.8082, 88.2355, 1.57, 3.13, 2.59, 0.78, true),
('Dankuni Toll Plaza', 'Dankuni, West Bengal', 22.6846, 88.2914, 2.05, 4.10, 3.37, 1.02, true),
('Vidyasagar Setu Toll', 'Howrah, West Bengal', 22.5558, 88.3255, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- NH-66: MUMBAI → GOA → MANGALORE → KOCHI → TRIVANDRUM
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Ratnagiri Toll Plaza', 'Ratnagiri, Maharashtra', 16.9900, 73.3070, 1.81, 3.61, 3.01, 0.90, true),
('Malwan Toll Plaza', 'Malwan, Maharashtra', 16.0587, 73.4623, 1.57, 3.13, 2.59, 0.78, true),
('Sawantwadi Toll Plaza', 'Sawantwadi, Maharashtra', 15.9044, 73.8189, 1.69, 3.37, 2.77, 0.84, true),
('Patradevi Toll Plaza', 'Patradevi, Goa', 15.6338, 73.8102, 1.45, 2.89, 2.41, 0.72, true),
('Bambolim Toll Plaza', 'Bambolim, Goa', 15.4647, 73.8565, 1.33, 2.65, 2.17, 0.66, true),
('Zuari Bridge Toll', 'Zuari, Goa', 15.4109, 73.9504, 1.81, 3.61, 3.01, 0.90, true),
('Canacona Toll Plaza', 'Canacona, Goa', 15.0101, 74.0518, 1.45, 2.89, 2.41, 0.72, true),
('Karwar Toll Plaza', 'Karwar, Karnataka', 14.8024, 74.1297, 1.57, 3.13, 2.59, 0.78, true),
('Kumta Toll Plaza', 'Kumta, Karnataka', 14.4267, 74.4140, 1.45, 2.89, 2.41, 0.72, true),
('Bhatkal Toll Plaza', 'Bhatkal, Karnataka', 13.9634, 74.5556, 1.57, 3.13, 2.59, 0.78, true),
('Udupi Toll Plaza', 'Udupi, Karnataka', 13.3389, 74.7451, 1.69, 3.37, 2.77, 0.84, true),
('Surathkal Toll Plaza', 'Surathkal, Karnataka', 12.9876, 74.7888, 1.81, 3.61, 3.01, 0.90, true),
('Mangalore Toll Plaza', 'Mangalore, Karnataka', 12.8659, 74.8426, 1.93, 3.86, 3.19, 0.96, true),
('Kasaragod Toll Plaza', 'Kasaragod, Kerala', 12.4996, 74.9893, 1.57, 3.13, 2.59, 0.78, true),
('Kannur Toll Plaza', 'Kannur, Kerala', 11.8745, 75.3704, 1.69, 3.37, 2.77, 0.84, true),
('Kozhikode Toll Plaza', 'Kozhikode, Kerala', 11.2588, 75.7804, 1.81, 3.61, 3.01, 0.90, true),
('Thrissur Toll Plaza', 'Thrissur, Kerala', 10.5276, 76.2144, 1.69, 3.37, 2.77, 0.84, true),
('Aluva Toll Plaza', 'Aluva, Kerala', 10.1004, 76.3534, 1.57, 3.13, 2.59, 0.78, true),
('Kochi Toll Plaza', 'Kochi, Kerala', 9.9816, 76.2999, 2.05, 4.10, 3.37, 1.02, true),
('Alappuzha Toll Plaza', 'Alappuzha, Kerala', 9.4981, 76.3388, 1.45, 2.89, 2.41, 0.72, true),
('Kollam Toll Plaza', 'Kollam, Kerala', 8.8932, 76.6141, 1.57, 3.13, 2.59, 0.78, true),
('Trivandrum Toll Plaza', 'Trivandrum, Kerala', 8.5241, 76.9366, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- NH-75 / NH-275: BANGALORE → MYSORE → MANGALORE
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Ramanagara Toll Plaza', 'Ramanagara, Karnataka', 12.7159, 77.2827, 1.81, 3.61, 3.01, 0.90, true),
('Mandya Toll Plaza', 'Mandya, Karnataka', 12.5218, 76.8951, 1.57, 3.13, 2.59, 0.78, true),
('Srirangapatna Toll', 'Srirangapatna, Karnataka', 12.4185, 76.6940, 1.45, 2.89, 2.41, 0.72, true),
('Mysore Toll Plaza', 'Mysore, Karnataka', 12.2958, 76.6394, 1.93, 3.86, 3.19, 0.96, true),
('Hassan Toll Plaza', 'Hassan, Karnataka', 13.0072, 76.0996, 1.69, 3.37, 2.77, 0.84, true),
('Sakleshpur Toll Plaza', 'Sakleshpur, Karnataka', 12.9400, 75.7847, 1.57, 3.13, 2.59, 0.78, true),
('Bantwal Toll Plaza', 'Bantwal, Karnataka', 12.8916, 75.0270, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- NH-52 / NH-5: DELHI → CHANDIGARH → SHIMLA / MANALI
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Sonipat Toll Plaza', 'Sonipat, Haryana', 28.9931, 77.0151, 1.57, 3.13, 2.59, 0.78, true),
('Panipat Toll Plaza', 'Panipat, Haryana', 29.3909, 76.9635, 1.81, 3.61, 3.01, 0.90, true),
('Karnal Toll Plaza', 'Karnal, Haryana', 29.6857, 76.9905, 1.69, 3.37, 2.77, 0.84, true),
('Kurukshetra Toll Plaza', 'Kurukshetra, Haryana', 29.9695, 76.8783, 1.57, 3.13, 2.59, 0.78, true),
('Ambala Toll Plaza', 'Ambala, Haryana', 30.3752, 76.7821, 1.93, 3.86, 3.19, 0.96, true),
('Zirakpur Toll Plaza', 'Zirakpur, Punjab', 30.6428, 76.8181, 2.17, 4.34, 3.61, 1.08, true),
('Chandigarh Toll Plaza', 'Chandigarh', 30.7333, 76.7794, 2.05, 4.10, 3.37, 1.02, true),
('Pinjore Toll Plaza', 'Pinjore, Haryana', 30.7970, 76.9119, 1.57, 3.13, 2.59, 0.78, true),
('Parwanoo Toll Plaza', 'Parwanoo, HP', 30.8376, 76.9618, 1.81, 3.61, 3.01, 0.90, true),
('Solan Toll Plaza', 'Solan, HP', 30.9045, 77.0967, 1.69, 3.37, 2.77, 0.84, true),
('Shimla Toll Plaza', 'Shimla, HP', 31.1048, 77.1734, 2.05, 4.10, 3.37, 1.02, true),
('Bilaspur (HP) Toll', 'Bilaspur, HP', 31.3324, 76.7559, 1.57, 3.13, 2.59, 0.78, true),
('Sundernagar Toll Plaza', 'Sundernagar, HP', 31.5277, 76.9057, 1.45, 2.89, 2.41, 0.72, true),
('Mandi Toll Plaza', 'Mandi, HP', 31.7085, 76.9318, 1.69, 3.37, 2.77, 0.84, true),
('Kullu Toll Plaza', 'Kullu, HP', 31.9579, 77.1090, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- NH-334 / DELHI → DEHRADUN → HARIDWAR
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Meerut Toll Plaza', 'Meerut, UP', 28.9845, 77.7064, 1.81, 3.61, 3.01, 0.90, true),
('Muzaffarnagar Toll Plaza', 'Muzaffarnagar, UP', 29.4727, 77.7085, 1.69, 3.37, 2.77, 0.84, true),
('Roorkee Toll Plaza', 'Roorkee, Uttarakhand', 29.8543, 77.8880, 1.57, 3.13, 2.59, 0.78, true),
('Haridwar Toll Plaza', 'Haridwar, Uttarakhand', 29.9457, 78.1642, 2.05, 4.10, 3.37, 1.02, true),
('Dehradun Toll Plaza', 'Dehradun, Uttarakhand', 30.3165, 78.0322, 1.93, 3.86, 3.19, 0.96, true),
('Rishikesh Toll Plaza', 'Rishikesh, Uttarakhand', 30.0869, 78.2676, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- DELHI → LUCKNOW → GORAKHPUR (NH-27/NH-730)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Ghaziabad Toll Plaza', 'Ghaziabad, UP', 28.6692, 77.4538, 1.45, 2.89, 2.41, 0.72, true),
('Hapur Toll Plaza', 'Hapur, UP', 28.7307, 77.7800, 1.57, 3.13, 2.59, 0.78, true),
('Moradabad Toll Plaza', 'Moradabad, UP', 28.8386, 78.7768, 1.69, 3.37, 2.77, 0.84, true),
('Bareilly Toll Plaza', 'Bareilly, UP', 28.3670, 79.4304, 1.81, 3.61, 3.01, 0.90, true),
('Shahjahanpur Toll (UP)', 'Shahjahanpur, UP', 27.8826, 79.9120, 1.57, 3.13, 2.59, 0.78, true),
('Sitapur Toll Plaza', 'Sitapur, UP', 27.5731, 80.6838, 1.45, 2.89, 2.41, 0.72, true),
('Barabanki Toll Plaza', 'Barabanki, UP', 26.9260, 81.1891, 1.57, 3.13, 2.59, 0.78, true),
('Faizabad Toll Plaza', 'Faizabad, UP', 26.7730, 82.1449, 1.69, 3.37, 2.77, 0.84, true),
('Gorakhpur Toll Plaza', 'Gorakhpur, UP', 26.7606, 83.3731, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- JAIPUR → JODHPUR → BARMER (NH-62/NH-25)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Dudu Toll Plaza', 'Dudu, Rajasthan', 26.6158, 75.5788, 1.57, 3.13, 2.59, 0.78, true),
('Kishangarh Toll Plaza', 'Kishangarh, Rajasthan', 26.5852, 74.8544, 1.69, 3.37, 2.77, 0.84, true),
('Merta Toll Plaza', 'Merta, Rajasthan', 26.6498, 74.0313, 1.45, 2.89, 2.41, 0.72, true),
('Jodhpur Toll Plaza', 'Jodhpur, Rajasthan', 26.2389, 73.0243, 1.93, 3.86, 3.19, 0.96, true),
('Barmer Toll Plaza', 'Barmer, Rajasthan', 25.7546, 71.3927, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- PUNE → NASHIK → AURANGABAD → NAGPUR (NH-160/NH-753)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Narayangaon Toll Plaza', 'Narayangaon, Maharashtra', 19.1025, 73.9539, 1.81, 3.61, 3.01, 0.90, true),
('Sangamner Toll Plaza', 'Sangamner, Maharashtra', 19.5691, 74.2085, 1.57, 3.13, 2.59, 0.78, true),
('Nashik Toll Plaza', 'Nashik, Maharashtra', 19.9975, 73.7898, 2.05, 4.10, 3.37, 1.02, true),
('Sinnar Toll Plaza', 'Sinnar, Maharashtra', 19.8434, 73.9948, 1.45, 2.89, 2.41, 0.72, true),
('Aurangabad Toll Plaza', 'Aurangabad, Maharashtra', 19.8762, 75.3433, 1.93, 3.86, 3.19, 0.96, true),
('Jalna Toll Plaza', 'Jalna, Maharashtra', 19.8413, 75.8803, 1.57, 3.13, 2.59, 0.78, true),
('Washim Toll Plaza', 'Washim, Maharashtra', 20.1072, 77.1500, 1.45, 2.89, 2.41, 0.72, true),
('Wardha Toll Plaza', 'Wardha, Maharashtra', 20.7453, 78.5979, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- CHENNAI → SALEM → COIMBATORE → COCHIN (NH-544)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Mamallapuram Toll', 'Mamallapuram, Tamil Nadu', 12.6208, 80.1924, 1.57, 3.13, 2.59, 0.78, true),
('Villupuram Toll Plaza', 'Villupuram, Tamil Nadu', 11.9395, 79.4930, 1.69, 3.37, 2.77, 0.84, true),
('Salem Toll Plaza', 'Salem, Tamil Nadu', 11.6643, 78.1460, 1.93, 3.86, 3.19, 0.96, true),
('Erode Toll Plaza', 'Erode, Tamil Nadu', 11.3410, 77.7172, 1.57, 3.13, 2.59, 0.78, true),
('Tirupur Toll Plaza', 'Tirupur, Tamil Nadu', 11.1085, 77.3411, 1.69, 3.37, 2.77, 0.84, true),
('Coimbatore Toll Plaza', 'Coimbatore, Tamil Nadu', 11.0168, 76.9558, 2.05, 4.10, 3.37, 1.02, true),
('Palakkad Toll Plaza', 'Palakkad, Kerala', 10.7867, 76.6548, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- HYDERABAD → VIJAYAWADA → VISAKHAPATNAM (NH-65/NH-16)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Nalgonda Toll Plaza', 'Nalgonda, Telangana', 17.0575, 79.2671, 1.69, 3.37, 2.77, 0.84, true),
('Suryapet Toll Plaza', 'Suryapet, Telangana', 17.1393, 79.6371, 1.57, 3.13, 2.59, 0.78, true),
('Kodad Toll Plaza', 'Kodad, Telangana', 16.9951, 79.9708, 1.45, 2.89, 2.41, 0.72, true),
('Vijayawada Toll Plaza', 'Vijayawada, AP', 16.5062, 80.6480, 2.17, 4.34, 3.61, 1.08, true),
('Eluru Toll Plaza', 'Eluru, AP', 16.7107, 81.0952, 1.57, 3.13, 2.59, 0.78, true),
('Rajahmundry Toll Plaza', 'Rajahmundry, AP', 17.0005, 81.7840, 1.81, 3.61, 3.01, 0.90, true),
('Tuni Toll Plaza', 'Tuni, AP', 17.3543, 82.5487, 1.45, 2.89, 2.41, 0.72, true),
('Anakapalle Toll Plaza', 'Anakapalle, AP', 17.6913, 83.0036, 1.57, 3.13, 2.59, 0.78, true),
('Visakhapatnam Toll', 'Visakhapatnam, AP', 17.6868, 83.2185, 2.05, 4.10, 3.37, 1.02, true);

-- ════════════════════════════════════════════
-- KOLKATA → KHARAGPUR → BHUBANESWAR → VISAKHAPATNAM (NH-16)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Kolaghat Toll Plaza', 'Kolaghat, West Bengal', 22.4301, 87.8908, 1.57, 3.13, 2.59, 0.78, true),
('Kharagpur Toll Plaza', 'Kharagpur, West Bengal', 22.3460, 87.2320, 1.81, 3.61, 3.01, 0.90, true),
('Balasore Toll Plaza', 'Balasore, Odisha', 21.4942, 86.9313, 1.69, 3.37, 2.77, 0.84, true),
('Bhadrak Toll Plaza', 'Bhadrak, Odisha', 21.0544, 86.4953, 1.57, 3.13, 2.59, 0.78, true),
('Cuttack Toll Plaza', 'Cuttack, Odisha', 20.4625, 85.8830, 1.93, 3.86, 3.19, 0.96, true),
('Bhubaneswar Toll Plaza', 'Bhubaneswar, Odisha', 20.2961, 85.8245, 2.17, 4.34, 3.61, 1.08, true),
('Berhampur Toll Plaza', 'Berhampur, Odisha', 19.3150, 84.7941, 1.69, 3.37, 2.77, 0.84, true),
('Srikakulam Toll Plaza', 'Srikakulam, AP', 18.2949, 83.8976, 1.57, 3.13, 2.59, 0.78, true),
('Vizianagaram Toll Plaza', 'Vizianagaram, AP', 18.1067, 83.3956, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- SAMRUDDHI MAHAMARG (NAGPUR-MUMBAI EXPRESSWAY)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Igatpuri Toll Plaza', 'Igatpuri, Maharashtra', 19.6970, 73.5600, 2.89, 5.78, 4.70, 1.45, true),
('Shirdi Toll Plaza', 'Shirdi, Maharashtra', 19.7668, 74.4770, 2.41, 4.82, 3.97, 1.20, true),
('Shrirampur Toll Plaza', 'Shrirampur, Maharashtra', 19.6187, 74.6526, 1.81, 3.61, 3.01, 0.90, true),
('Buldhana Toll Plaza', 'Buldhana, Maharashtra', 20.5296, 76.1840, 1.69, 3.37, 2.77, 0.84, true),
('Amravati Toll Plaza', 'Amravati, Maharashtra', 20.9374, 77.7523, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- DELHI → AMRITSAR / LUDHIANA (NH-44 North)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Kundli Toll Plaza', 'Kundli, Haryana', 28.8643, 77.1189, 1.81, 3.61, 3.01, 0.90, true),
('Mukarba Chowk Toll', 'Delhi', 28.7227, 77.1548, 1.33, 2.65, 2.17, 0.66, true),
('Ludhiana Toll Plaza', 'Ludhiana, Punjab', 30.9010, 75.8573, 2.05, 4.10, 3.37, 1.02, true),
('Jalandhar Toll Plaza', 'Jalandhar, Punjab', 31.3260, 75.5762, 1.81, 3.61, 3.01, 0.90, true),
('Phagwara Toll Plaza', 'Phagwara, Punjab', 31.2240, 75.7708, 1.57, 3.13, 2.59, 0.78, true),
('Amritsar Toll Plaza', 'Amritsar, Punjab', 31.6340, 74.8723, 2.17, 4.34, 3.61, 1.08, true),
('Rajpura Toll Plaza', 'Rajpura, Punjab', 30.4842, 76.5918, 1.69, 3.37, 2.77, 0.84, true),
('Sirhind Toll Plaza', 'Sirhind, Punjab', 30.6468, 76.3938, 1.57, 3.13, 2.59, 0.78, true),
('Khanna Toll Plaza', 'Khanna, Punjab', 30.6975, 76.2115, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- BANGALORE → CHENNAI (NH-48)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Attibele Toll Plaza', 'Attibele, Karnataka', 12.7793, 77.7728, 2.05, 4.10, 3.37, 1.02, true),
('Ambur Toll Plaza', 'Ambur, Tamil Nadu', 12.7893, 78.7186, 1.69, 3.37, 2.77, 0.84, true),
('Ranipet Toll Plaza', 'Ranipet, Tamil Nadu', 12.9318, 79.3334, 1.81, 3.61, 3.01, 0.90, true),
('Poonamallee Toll', 'Poonamallee, Tamil Nadu', 13.0468, 80.0966, 1.93, 3.86, 3.19, 0.96, true);

-- ════════════════════════════════════════════
-- AHMEDABAD → RAJKOT → JAMNAGAR (NH-47)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Limbdi Toll Plaza', 'Limbdi, Gujarat', 22.5694, 71.8098, 1.57, 3.13, 2.59, 0.78, true),
('Rajkot Toll Plaza', 'Rajkot, Gujarat', 22.3039, 70.8022, 1.93, 3.86, 3.19, 0.96, true),
('Jamnagar Toll Plaza', 'Jamnagar, Gujarat', 22.4707, 70.0577, 1.69, 3.37, 2.77, 0.84, true),
('Dwarka Highway Toll', 'Dwarka, Gujarat', 22.2394, 68.9679, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- KOLKATA → SILIGURI / GUWAHATI (NH-34/NH-27)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Krishnanagar Toll', 'Krishnanagar, WB', 23.3892, 88.4872, 1.45, 2.89, 2.41, 0.72, true),
('Berhampore Toll Plaza', 'Berhampore, WB', 24.1010, 88.2515, 1.57, 3.13, 2.59, 0.78, true),
('Malda Toll Plaza', 'Malda, WB', 25.0064, 88.1410, 1.69, 3.37, 2.77, 0.84, true),
('Raiganj Toll Plaza', 'Raiganj, WB', 25.6154, 88.1244, 1.57, 3.13, 2.59, 0.78, true),
('Siliguri Toll Plaza', 'Siliguri, WB', 26.7102, 88.4295, 2.05, 4.10, 3.37, 1.02, true),
('Jalpaiguri Toll Plaza', 'Jalpaiguri, WB', 26.5168, 88.7295, 1.45, 2.89, 2.41, 0.72, true),
('Cooch Behar Toll Plaza', 'Cooch Behar, WB', 26.3325, 89.4488, 1.57, 3.13, 2.59, 0.78, true),
('Guwahati Toll Plaza', 'Guwahati, Assam', 26.1445, 91.7362, 2.17, 4.34, 3.61, 1.08, true),
('Nagaon Toll Plaza', 'Nagaon, Assam', 26.3480, 92.6839, 1.57, 3.13, 2.59, 0.78, true),
('Tezpur Toll Plaza', 'Tezpur, Assam', 26.6338, 92.8007, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- PATNA → RANCHI → JAMSHEDPUR (NH-33/NH-2)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Patna Toll Plaza', 'Patna, Bihar', 25.6093, 85.1376, 1.93, 3.86, 3.19, 0.96, true),
('Bakhtiyarpur Toll', 'Bakhtiyarpur, Bihar', 25.4638, 85.5331, 1.45, 2.89, 2.41, 0.72, true),
('Nawada Toll Plaza', 'Nawada, Bihar', 24.8860, 85.5348, 1.57, 3.13, 2.59, 0.78, true),
('Hazaribagh Toll Plaza', 'Hazaribagh, Jharkhand', 23.9925, 85.3637, 1.69, 3.37, 2.77, 0.84, true),
('Ranchi Toll Plaza', 'Ranchi, Jharkhand', 23.3441, 85.3096, 2.05, 4.10, 3.37, 1.02, true),
('Jamshedpur Toll Plaza', 'Jamshedpur, Jharkhand', 22.8046, 86.2029, 1.81, 3.61, 3.01, 0.90, true);

-- ════════════════════════════════════════════
-- LUCKNOW → AYODHYA → PATNA (NH-28/NH-30)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Ayodhya Toll Plaza', 'Ayodhya, UP', 26.7922, 82.1998, 1.81, 3.61, 3.01, 0.90, true),
('Basti Toll Plaza', 'Basti, UP', 26.8014, 82.7510, 1.45, 2.89, 2.41, 0.72, true),
('Deoria Toll Plaza', 'Deoria, UP', 26.5024, 83.7791, 1.57, 3.13, 2.59, 0.78, true),
('Chhapra Toll Plaza', 'Chhapra, Bihar', 25.7805, 84.7464, 1.69, 3.37, 2.77, 0.84, true),
('Hajipur Toll Plaza', 'Hajipur, Bihar', 25.6871, 85.2158, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- BENGALURU → GOA (NH-48/NH-4)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Nelamangala Toll Plaza', 'Nelamangala, Karnataka', 13.0966, 77.3920, 1.93, 3.86, 3.19, 0.96, true),
('Tumkur Toll Plaza', 'Tumkur, Karnataka', 13.3400, 77.1024, 1.69, 3.37, 2.77, 0.84, true),
('Chitradurga Toll Plaza', 'Chitradurga, Karnataka', 14.2227, 76.3980, 1.81, 3.61, 3.01, 0.90, true),
('Davangere Toll Plaza', 'Davangere, Karnataka', 14.4644, 75.9218, 1.57, 3.13, 2.59, 0.78, true),
('Hubli Toll Plaza', 'Hubli, Karnataka', 15.3647, 75.1240, 2.05, 4.10, 3.37, 1.02, true),
('Dharwad Toll Plaza', 'Dharwad, Karnataka', 15.4589, 75.0078, 1.45, 2.89, 2.41, 0.72, true),
('Belgaum Toll Plaza', 'Belgaum, Karnataka', 15.8497, 74.4977, 1.81, 3.61, 3.01, 0.90, true),
('Kolhapur Toll Plaza', 'Kolhapur, Maharashtra', 16.7050, 74.2433, 1.69, 3.37, 2.77, 0.84, true),
('Satara Toll Plaza', 'Satara, Maharashtra', 17.6805, 74.0183, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- EXPRESSWAYS: YAMUNA / EASTERN PERIPHERAL / WESTERN PERIPHERAL
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
-- Yamuna Expressway (Delhi-Agra)
('Jewar Toll Plaza', 'Jewar, UP', 28.1140, 77.5560, 2.89, 5.78, 4.70, 1.45, true),
('Mathura (YE) Toll', 'Mathura, UP', 27.4923, 77.6737, 2.53, 5.06, 4.10, 1.27, true),
-- Eastern Peripheral Expressway
('Kundli-Manesar-Palwal (KMP) Toll East', 'Sonipat, Haryana', 28.8200, 77.0730, 2.41, 4.82, 3.97, 1.20, true),
('KMP Toll Plaza (Palwal)', 'Palwal, Haryana', 28.2551, 77.3353, 2.41, 4.82, 3.97, 1.20, true),
-- Western Peripheral
('KMP Toll (Manesar)', 'Manesar, Haryana', 28.3621, 76.9330, 2.41, 4.82, 3.97, 1.20, true),
-- Dwarka Expressway
('Dwarka Exp Toll', 'Gurugram, Haryana', 28.4706, 76.9762, 2.29, 4.58, 3.73, 1.14, true),
-- Delhi-Meerut Expressway
('Delhi-Meerut Exp Toll (Dasna)', 'Dasna, UP', 28.6786, 77.5363, 2.53, 5.06, 4.10, 1.27, true),
-- Purvanchal Expressway
('Purvanchal Exp Toll (Lucknow)', 'Lucknow, UP', 26.7939, 81.0432, 2.89, 5.78, 4.70, 1.45, true),
('Purvanchal Exp Toll (Ghazipur)', 'Ghazipur, UP', 25.5878, 83.5737, 2.89, 5.78, 4.70, 1.45, true),
-- Bundelkhand Expressway
('Bundelkhand Exp Toll (Chitrakoot)', 'Chitrakoot, UP', 25.2048, 80.8493, 2.53, 5.06, 4.10, 1.27, true);

-- ════════════════════════════════════════════
-- HYDERABAD → BANGALORE (NH-44 South)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Shamshabad Toll (South)', 'Shamshabad, Telangana', 17.2134, 78.3837, 2.05, 4.10, 3.37, 1.02, true),
('Mahbubnagar Toll Plaza', 'Mahbubnagar, Telangana', 16.7488, 78.0005, 1.69, 3.37, 2.77, 0.84, true),
('Raichur Toll Plaza', 'Raichur, Karnataka', 16.2076, 77.3550, 1.81, 3.61, 3.01, 0.90, true),
('Bellary Toll Plaza', 'Bellary, Karnataka', 15.1394, 76.9214, 1.69, 3.37, 2.77, 0.84, true),
('Anantapur (South) Toll', 'Anantapur, AP', 14.6810, 77.5998, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- CHENNAI → PONDICHERRY → MADURAI → KANYAKUMARI (NH-32/NH-44)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Chengalpattu Toll Plaza', 'Chengalpattu, Tamil Nadu', 12.6819, 79.9888, 1.69, 3.37, 2.77, 0.84, true),
('Tindivanam Toll Plaza', 'Tindivanam, Tamil Nadu', 12.2314, 79.6558, 1.57, 3.13, 2.59, 0.78, true),
('Pondicherry Toll Plaza', 'Pondicherry', 11.9416, 79.8083, 1.81, 3.61, 3.01, 0.90, true),
('Trichy Toll Plaza', 'Trichy, Tamil Nadu', 10.7905, 78.7047, 1.93, 3.86, 3.19, 0.96, true),
('Dindigul Toll Plaza', 'Dindigul, Tamil Nadu', 10.3624, 77.9695, 1.57, 3.13, 2.59, 0.78, true),
('Madurai Toll Plaza', 'Madurai, Tamil Nadu', 9.9252, 78.1198, 2.05, 4.10, 3.37, 1.02, true),
('Virudhunagar Toll Plaza', 'Virudhunagar, Tamil Nadu', 9.5851, 77.9577, 1.45, 2.89, 2.41, 0.72, true),
('Tirunelveli Toll Plaza', 'Tirunelveli, Tamil Nadu', 8.7284, 77.6816, 1.69, 3.37, 2.77, 0.84, true),
('Nagercoil Toll Plaza', 'Nagercoil, Tamil Nadu', 8.1833, 77.4119, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- RAIPUR → BILASPUR / BHOPAL (NH-30/NH-46)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Bhopal Toll Plaza', 'Bhopal, MP', 23.2599, 77.4126, 1.93, 3.86, 3.19, 0.96, true),
('Vidisha Toll Plaza', 'Vidisha, MP', 23.5251, 77.8081, 1.57, 3.13, 2.59, 0.78, true),
('Jabalpur Toll Plaza', 'Jabalpur, MP', 23.1815, 79.9864, 1.81, 3.61, 3.01, 0.90, true),
('Katni Toll Plaza', 'Katni, MP', 23.8383, 80.3938, 1.45, 2.89, 2.41, 0.72, true),
('Bilaspur (CG) Toll', 'Bilaspur, Chhattisgarh', 22.0797, 82.1391, 1.69, 3.37, 2.77, 0.84, true),
('Raipur Toll Plaza', 'Raipur, Chhattisgarh', 21.2514, 81.6296, 2.05, 4.10, 3.37, 1.02, true),
('Durg Toll Plaza', 'Durg, Chhattisgarh', 21.1904, 81.2849, 1.57, 3.13, 2.59, 0.78, true),
('Indore Toll Plaza', 'Indore, MP', 22.7196, 75.8577, 2.17, 4.34, 3.61, 1.08, true),
('Ujjain Toll Plaza', 'Ujjain, MP', 23.1793, 75.7849, 1.69, 3.37, 2.77, 0.84, true),
('Dewas Toll Plaza', 'Dewas, MP', 22.9623, 76.0508, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- AHMEDABAD → MOUNT ABU → UDAIPUR (NH-48/NH-27)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Himatnagar Toll Plaza', 'Himatnagar, Gujarat', 23.5960, 72.9518, 1.57, 3.13, 2.59, 0.78, true),
('Idar Toll Plaza', 'Idar, Gujarat', 23.8387, 73.0073, 1.45, 2.89, 2.41, 0.72, true),
('Dungarpur Toll Plaza', 'Dungarpur, Rajasthan', 23.8443, 73.7150, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- BANGALORE → TIRUPATI → NELLORE (NH-69)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Kolar Toll Plaza', 'Kolar, Karnataka', 13.1363, 78.1299, 1.69, 3.37, 2.77, 0.84, true),
('Chittoor Toll Plaza', 'Chittoor, AP', 13.2172, 79.1003, 1.57, 3.13, 2.59, 0.78, true),
('Tirupati Toll Plaza', 'Tirupati, AP', 13.6288, 79.4192, 2.17, 4.34, 3.61, 1.08, true),
('Nellore Toll Plaza', 'Nellore, AP', 14.4426, 79.9865, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- JAIPUR → BIKANER → JAISALMER (NH-11/NH-15)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Sikar Toll Plaza', 'Sikar, Rajasthan', 27.6094, 75.1398, 1.57, 3.13, 2.59, 0.78, true),
('Churu Toll Plaza', 'Churu, Rajasthan', 28.2955, 74.9682, 1.45, 2.89, 2.41, 0.72, true),
('Bikaner Toll Plaza', 'Bikaner, Rajasthan', 28.0229, 73.3119, 1.81, 3.61, 3.01, 0.90, true),
('Jaisalmer Toll Plaza', 'Jaisalmer, Rajasthan', 26.9157, 70.9083, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- DELHI → JAIPUR (NH-48) Additional / Delhi-Jaipur Expressway
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Delhi-Jaipur Exp (Gurugram)', 'Gurugram, Haryana', 28.4595, 77.0266, 2.89, 5.78, 4.70, 1.45, true),
('Delhi-Jaipur Exp (Bhiwadi)', 'Bhiwadi, Rajasthan', 28.2105, 76.8512, 2.53, 5.06, 4.10, 1.27, true);

-- ════════════════════════════════════════════
-- BENGALURU → HYDERABAD VIA SOLAPUR (NH-44)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Solapur Toll Plaza', 'Solapur, Maharashtra', 17.6599, 75.9064, 1.81, 3.61, 3.01, 0.90, true),
('Pandharpur Toll Plaza', 'Pandharpur, Maharashtra', 17.6768, 75.3268, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- NAGPUR → RAIPUR → BHUBANESWAR (NH-53)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Tumsar Toll Plaza', 'Tumsar, Maharashtra', 21.3842, 79.7323, 1.57, 3.13, 2.59, 0.78, true),
('Gondia Toll Plaza', 'Gondia, Maharashtra', 21.4602, 80.1961, 1.45, 2.89, 2.41, 0.72, true),
('Rajnandgaon Toll Plaza', 'Rajnandgaon, CG', 21.0970, 81.0288, 1.69, 3.37, 2.77, 0.84, true),
('Sambalpur Toll Plaza', 'Sambalpur, Odisha', 21.4669, 83.9756, 1.81, 3.61, 3.01, 0.90, true),
('Angul Toll Plaza', 'Angul, Odisha', 20.8401, 85.1011, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- MUMBAI → SHIRDI → AURANGABAD (NH-160/NH-753)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Thane Toll Plaza', 'Thane, Maharashtra', 19.2183, 72.9781, 1.57, 3.13, 2.59, 0.78, true),
('Kasara Toll Plaza', 'Kasara, Maharashtra', 19.6321, 73.4801, 1.81, 3.61, 3.01, 0.90, true),
('Ghoti Toll Plaza', 'Ghoti, Maharashtra', 19.7183, 73.6290, 1.57, 3.13, 2.59, 0.78, true),
('Ahmednagar Toll Plaza', 'Ahmednagar, Maharashtra', 19.0948, 74.7480, 1.69, 3.37, 2.77, 0.84, true);

-- ════════════════════════════════════════════
-- SURAT → MUMBAI COASTAL (NH-48/NH-8)
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Navsari Toll Plaza', 'Navsari, Gujarat', 20.9467, 72.9520, 1.57, 3.13, 2.59, 0.78, true),
('Palghar Toll Plaza', 'Palghar, Maharashtra', 19.6969, 72.7651, 1.81, 3.61, 3.01, 0.90, true),
('Virar Toll Plaza', 'Virar, Maharashtra', 19.4558, 72.8109, 1.45, 2.89, 2.41, 0.72, true);

-- ════════════════════════════════════════════
-- NORTHEAST: GUWAHATI → SHILLONG / IMPHAL / DIMAPUR
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
('Jorabat Toll Plaza', 'Jorabat, Assam', 26.0728, 91.8967, 1.69, 3.37, 2.77, 0.84, true),
('Nongpoh Toll Plaza', 'Nongpoh, Meghalaya', 25.8877, 91.8770, 1.57, 3.13, 2.59, 0.78, true),
('Shillong Toll Plaza', 'Shillong, Meghalaya', 25.5788, 91.8933, 1.81, 3.61, 3.01, 0.90, true),
('Dimapur Toll Plaza', 'Dimapur, Nagaland', 25.7080, 93.7268, 1.69, 3.37, 2.77, 0.84, true),
('Silchar Toll Plaza', 'Silchar, Assam', 24.8333, 92.7789, 1.57, 3.13, 2.59, 0.78, true);

-- ════════════════════════════════════════════
-- MISCELLANEOUS KEY CONNECTIONS
-- ════════════════════════════════════════════
INSERT INTO toll_plazas (name, location_name, latitude, longitude, car_charge, truck_charge, bus_charge, motorcycle_charge, active) VALUES
-- Chandigarh-Delhi via Kundli
('Murthal Toll Plaza', 'Murthal, Haryana', 29.0266, 77.0507, 1.45, 2.89, 2.41, 0.72, true),
-- Ahmedabad-Indore
('Godhra Toll Plaza', 'Godhra, Gujarat', 22.7753, 73.6150, 1.57, 3.13, 2.59, 0.78, true),
('Dahod Toll Plaza', 'Dahod, Gujarat', 22.8376, 74.2545, 1.45, 2.89, 2.41, 0.72, true),
-- Jaipur-Agra
('Bharatpur Toll Plaza', 'Bharatpur, Rajasthan', 27.2172, 77.4898, 1.69, 3.37, 2.77, 0.84, true),
-- Lucknow-Allahabad
('Pratapgarh Toll Plaza', 'Pratapgarh, UP', 25.8973, 81.9945, 1.57, 3.13, 2.59, 0.78, true),
('Allahabad Toll Plaza', 'Allahabad, UP', 25.4358, 81.8463, 1.81, 3.61, 3.01, 0.90, true),
-- Srinagar Highway
('Jammu Toll Plaza', 'Jammu, J&K', 32.7266, 74.8570, 2.05, 4.10, 3.37, 1.02, true),
('Udhampur Toll Plaza', 'Udhampur, J&K', 32.9160, 75.1419, 1.81, 3.61, 3.01, 0.90, true),
('Banihal Toll Plaza', 'Banihal, J&K', 33.4334, 75.1960, 2.41, 4.82, 3.97, 1.20, true),
-- Goa-Belgaum
('Sanquelim Toll', 'Sanquelim, Goa', 15.5631, 74.0101, 1.45, 2.89, 2.41, 0.72, true),
-- Thrissur-Palakkad
('Wadakkanchery Toll', 'Wadakkanchery, Kerala', 10.6585, 76.2736, 1.57, 3.13, 2.59, 0.78, true),
-- Mysore-Ooty
('Gundlupet Toll Plaza', 'Gundlupet, Karnataka', 11.8044, 76.6886, 1.45, 2.89, 2.41, 0.72, true),
-- Pune-Solapur
('Yavat Toll Plaza', 'Yavat, Maharashtra', 18.5071, 74.1713, 1.69, 3.37, 2.77, 0.84, true),
('Indapur Toll Plaza', 'Indapur, Maharashtra', 18.1138, 75.0226, 1.57, 3.13, 2.59, 0.78, true),
-- Bareilly-Nainital
('Haldwani Toll Plaza', 'Haldwani, Uttarakhand', 29.2183, 79.5130, 1.69, 3.37, 2.77, 0.84, true),
-- Agra-Gwalior additional
('Morena Toll Plaza', 'Morena, MP', 26.4904, 78.0002, 1.57, 3.13, 2.59, 0.78, true),
-- Vadodara-Surat via NH-8
('Ankleshwar Toll Plaza', 'Ankleshwar, Gujarat', 21.6260, 72.9920, 1.69, 3.37, 2.77, 0.84, true),
-- Delhi-Agra additional
('Greater Noida Toll', 'Greater Noida, UP', 28.4744, 77.5040, 1.81, 3.61, 3.01, 0.90, true),
-- Bhopal-Nagpur
('Chhindwara Toll Plaza', 'Chhindwara, MP', 22.0574, 78.9382, 1.57, 3.13, 2.59, 0.78, true),
('Seoni Toll Plaza', 'Seoni, MP', 22.0853, 79.5468, 1.45, 2.89, 2.41, 0.72, true),
-- Indore-Bhopal
('Sehore Toll Plaza', 'Sehore, MP', 23.2055, 77.0862, 1.57, 3.13, 2.59, 0.78, true),
-- Kerala Interior
('Kottayam Toll Plaza', 'Kottayam, Kerala', 9.5916, 76.5222, 1.45, 2.89, 2.41, 0.72, true),
('Pathanamthitta Toll', 'Pathanamthitta, Kerala', 9.2648, 76.7870, 1.57, 3.13, 2.59, 0.78, true);
