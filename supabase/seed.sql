-- Seed dataset for FasalSetu diagnoses spanning 6 Indian agricultural states
INSERT INTO public.diagnoses (id, created_at, state, crop_type, diagnosis_text, language, image_url)
VALUES
  -- Maharashtra
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-09-05 08:30:00+00', 'Maharashtra', 'Tomato', 'Early Blight: Dark concentric spots observed on lower foliage.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG'),
  ('a1b2c3d4-0001-4000-8000-000000000002', '2026-09-04 11:15:00+00', 'Maharashtra', 'Soybean', 'Soybean Rust: Small brown pustules on undersides of leaves.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0034a551-9512-44e5-ba6c-827f85ecc688___RS_Erly.B%209432.JPG'),
  ('a1b2c3d4-0001-4000-8000-000000000003', '2026-09-03 15:40:00+00', 'Maharashtra', 'Sugarcane', 'Looks Healthy: Vigorous cane shoots with healthy deep green leaves.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL%20Leaf%20259.1.JPG'),

  -- Punjab
  ('a1b2c3d4-0002-4000-8000-000000000001', '2026-09-05 07:10:00+00', 'Punjab', 'Wheat', 'Yellow Rust: Linear stripes of yellowish-orange pustules on leaves.', 'en', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Common_rust_/RS_Rust%201563.JPG'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-09-04 16:00:00+00', 'Punjab', 'Cotton', 'Cotton Leaf Curl Virus: Upward curling of leaves with enation on veins.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG'),
  ('a1b2c3d4-0002-4000-8000-000000000003', '2026-09-03 10:45:00+00', 'Punjab', 'Rice', 'Looks Healthy: Healthy tillering stage paddy canopy with clear foliage.', 'en', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL%20Leaf%20259.1.JPG'),

  -- West Bengal
  ('a1b2c3d4-0003-4000-8000-000000000001', '2026-09-05 06:45:00+00', 'West Bengal', 'Potato', 'Late Blight: Water-soaked necrotic lesions with white mildew sporulation.', 'bn', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG'),
  ('a1b2c3d4-0003-4000-8000-000000000002', '2026-09-04 08:20:00+00', 'West Bengal', 'Rice', 'Brown Spot: Oval sesame-seed shaped lesions on paddy leaf blades.', 'bn', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Common_rust_/RS_Rust%201563.JPG'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-09-03 11:50:00+00', 'West Bengal', 'Tomato', 'Looks Healthy: Healthy green foliage with uniform flower bud initiation.', 'bn', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL%20Leaf%20259.1.JPG'),

  -- Uttar Pradesh
  ('a1b2c3d4-0004-4000-8000-000000000001', '2026-09-05 09:15:00+00', 'Uttar Pradesh', 'Tomato', 'Leaf Curl Virus: Severe inward leaf puckering and vein thickening.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG'),
  ('a1b2c3d4-0004-4000-8000-000000000002', '2026-09-04 13:30:00+00', 'Uttar Pradesh', 'Mustard', 'Alternaria Blight: Concentric dark target spots on foliage.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0034a551-9512-44e5-ba6c-827f85ecc688___RS_Erly.B%209432.JPG'),

  -- Madhya Pradesh
  ('a1b2c3d4-0005-4000-8000-000000000001', '2026-09-05 08:00:00+00', 'Madhya Pradesh', 'Soybean', 'Yellow Mosaic Virus: Mottled chlorotic bright yellow patches.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG'),
  ('a1b2c3d4-0005-4000-8000-000000000002', '2026-09-03 16:10:00+00', 'Madhya Pradesh', 'Wheat', 'Black Stem Rust: Reddish-brown to black elongated pustules.', 'hi', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Common_rust_/RS_Rust%201563.JPG'),

  -- Karnataka
  ('a1b2c3d4-0006-4000-8000-000000000001', '2026-09-05 10:30:00+00', 'Karnataka', 'Corn', 'Common Rust: Golden-brown powdery pustules on leaf surfaces.', 'en', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Common_rust_/RS_Rust%201563.JPG'),
  ('a1b2c3d4-0006-4000-8000-000000000002', '2026-09-04 12:00:00+00', 'Karnataka', 'Cotton', 'Bacterial Blight: Angular water-soaked lesions turning reddish-brown.', 'en', 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG')
ON CONFLICT (id) DO NOTHING;
