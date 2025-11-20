-- Seed marketplace_products with sample data
-- This provides a diverse range of insurance products for testing the marketplace

-- Car Insurance Products
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Comprehensive Car Cover', 'AutoGuard Pro', 'auto', 45.99, 499.99,
  500000, 'Full comprehensive cover with breakdown assistance',
  'London', 25, 70, ARRAY['Breakdown Cover', 'Legal Cover', 'Courtesy Car', 'Windscreen Cover'],
  4.8, true, false, false, false,
  'Award-winning comprehensive car insurance with excellent customer service and fast claims processing.'
),
(
  'Young Driver Auto', 'AutoGuard Pro', 'auto', 89.99, 999.99,
  300000, 'Specialised insurance for young drivers',
  'London', 17, 25, ARRAY['Breakdown Cover', 'Key Cover', 'Personal Accident Cover'],
  4.5, true, false, false, false,
  'Tailored car insurance for young and new drivers with competitive premiums.'
),
(
  'Premium Motor Protection', 'DriveSecure UK', 'auto', 62.50, 699.99,
  750000, 'Executive car insurance with enhanced benefits',
  'UK-wide', 30, 75, ARRAY['Breakdown Cover', 'Legal Cover', 'European Cover', 'Courtesy Car', 'Key Cover'],
  4.9, true, false, false, false,
  'Premium car insurance designed for executive and luxury vehicles with worldwide coverage.'
);

-- Health Insurance Products
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Elite Health Plan', 'HealthFirst Elite', 'health', 189.99, 2099.99,
  2000000, 'Premium health insurance with extensive coverage',
  'UK-wide', 18, 65, ARRAY['24/7 Support', 'Dental Cover', 'Optical Cover', 'Mental Health Support', 'Physiotherapy'],
  4.9, false, true, true, false,
  'Comprehensive health insurance including dental, optical, and mental health support.'
),
(
  'Professional Health Plus', 'SecureLife Insurance', 'health', 145.00, 1599.99,
  1500000, 'Health insurance for professionals',
  'UK-wide', 25, 60, ARRAY['24/7 Support', 'Mental Health Support', 'Physiotherapy'],
  4.8, true, false, true, true,
  'Designed for professionals, including coverage for high-risk occupations.'
),
(
  'Essential Health Cover', 'HealthGuard Basic', 'health', 79.99, 879.99,
  500000, 'Affordable health insurance with core benefits',
  'UK-wide', 18, 70, ARRAY['24/7 Support', 'Mental Health Support'],
  4.5, true, false, false, false,
  'Budget-friendly health insurance covering essential medical needs.'
),
(
  'Family Health Shield', 'FamilyCare Insurance', 'health', 249.99, 2749.99,
  3000000, 'Comprehensive family health insurance',
  'UK-wide', 18, 65, ARRAY['24/7 Support', 'Dental Cover', 'Optical Cover', 'Mental Health Support', 'Physiotherapy', 'Travel Insurance'],
  4.7, false, true, true, false,
  'Complete health cover for families with children, including preventive care and specialist consultations.'
);

-- Life Insurance Products
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Essential Life Protection', 'LifeShield Plus', 'life', 24.99, 279.99,
  250000, 'Affordable life insurance with flexible terms',
  'UK-wide', 18, 75, ARRAY['Critical Illness', 'Income Protection', 'No Excess'],
  4.7, true, false, false, false,
  'Simple and affordable life insurance with no medical exam required for qualifying applicants.'
),
(
  'Premium Life Assurance', 'LifeGuard Elite', 'life', 56.99, 629.99,
  500000, 'Comprehensive life insurance with investment options',
  'UK-wide', 25, 70, ARRAY['Critical Illness', 'Income Protection'],
  4.8, false, true, true, true,
  'Premium life insurance with critical illness cover and income protection for high-risk professions.'
),
(
  'Family Life Plan', 'SecureLife Insurance', 'life', 89.99, 989.99,
  1000000, 'Life insurance designed for families',
  'UK-wide', 25, 65, ARRAY['Critical Illness', 'Income Protection'],
  4.6, false, true, true, false,
  'Comprehensive life insurance providing financial security for your family.'
);

-- Home Insurance Products
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Premium Home Shield', 'HomeGuard Elite', 'home', 34.99, 389.99,
  500000, 'Complete home and contents insurance',
  'UK-wide', NULL, NULL, ARRAY['Home Emergency', 'Legal Cover', 'Personal Accident Cover'],
  4.6, true, false, false, false,
  'Comprehensive home insurance covering buildings, contents, and personal belongings.'
),
(
  'Essential Home Cover', 'PropertySafe UK', 'home', 22.50, 249.99,
  300000, 'Affordable home and contents protection',
  'UK-wide', NULL, NULL, ARRAY['Home Emergency'],
  4.4, true, false, false, false,
  'Budget-friendly home insurance with essential coverage for buildings and contents.'
),
(
  'Luxury Property Protection', 'EliteHome Insurance', 'home', 89.99, 989.99,
  2000000, 'Premium insurance for high-value properties',
  'London', NULL, NULL, ARRAY['Home Emergency', 'Legal Cover', 'Personal Accident Cover'],
  4.9, false, false, false, false,
  'Specialist insurance for luxury homes and high-value contents with bespoke coverage.'
),
(
  'Landlord Complete', 'PropertyGuard Pro', 'home', 45.00, 499.99,
  750000, 'Insurance for landlords and rental properties',
  'UK-wide', NULL, NULL, ARRAY['Home Emergency', 'Legal Cover'],
  4.5, true, false, false, false,
  'Comprehensive landlord insurance covering buildings, contents, and liability protection.'
);

-- Travel Insurance Products (using 'other' policy type)
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Annual Multi-Trip Travel', 'TravelSafe UK', 'other', 18.99, 209.99,
  100000, 'Unlimited trips throughout the year',
  'UK-wide', 18, 75, ARRAY['European Cover', '24/7 Support'],
  4.6, true, false, true, false,
  'Annual travel insurance covering unlimited trips including pre-existing medical conditions.'
),
(
  'Backpacker Adventure', 'AdventureInsure', 'other', 29.99, 329.99,
  50000, 'Insurance for long-term travellers',
  'UK-wide', 18, 40, ARRAY['European Cover', '24/7 Support'],
  4.5, true, false, false, true,
  'Specialist travel insurance for backpackers and adventure travellers, covering high-risk activities.'
),
(
  'Premium World Travel', 'GlobalCover Elite', 'other', 39.99, 439.99,
  500000, 'Comprehensive worldwide travel insurance',
  'UK-wide', 18, 80, ARRAY['European Cover', '24/7 Support', 'Personal Accident Cover'],
  4.8, true, false, true, false,
  'Premium travel insurance with worldwide coverage including pre-existing conditions and cruise cover.'
);

-- Pet Insurance Products (using 'other' policy type)
INSERT INTO public.marketplace_products (
  product_name, insurer_name, policy_type, monthly_premium, annual_premium,
  coverage_amount, coverage_summary, region, min_age, max_age, extra_benefits,
  company_rating, instant_issue, requires_medical_exam, covers_pre_existing_conditions,
  covers_high_risk_jobs, description
) VALUES
(
  'Complete Pet Care', 'PetProtect UK', 'other', 25.99, 285.99,
  15000, 'Comprehensive pet insurance for dogs and cats',
  'UK-wide', NULL, NULL, ARRAY['24/7 Support', 'Dental Cover'],
  4.7, true, false, false, false,
  'Complete pet insurance covering vet fees, dental treatment, and third-party liability.'
),
(
  'Lifetime Pet Cover', 'AnimalCare Plus', 'other', 42.99, 472.99,
  25000, 'Lifetime cover for your pets',
  'UK-wide', NULL, NULL, ARRAY['24/7 Support', 'Dental Cover'],
  4.8, true, false, true, false,
  'Lifetime pet insurance with no upper age limit and cover for pre-existing conditions after waiting period.'
);
