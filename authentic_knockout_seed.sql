-- FIFA 2026 Knockout-Only Authentic Structure
-- Exactly 32 Matches representing the 48-team wildcard knockout topology.

INSERT INTO matches (match_code, stage, home_team, away_team, kickoff_time, status, multiplier)
VALUES
-- ROUND OF 32 (16 Matches, 32 Knockout Qualifiers)
('R32_001', 'round_of_32', 'Knockout Qualifier 1', 'Knockout Qualifier 2', '2026-06-28T16:00:00.000Z', 'scheduled', 1.2),
('R32_002', 'round_of_32', 'Knockout Qualifier 3', 'Knockout Qualifier 4', '2026-06-28T16:00:00.000Z', 'scheduled', 1.2),
('R32_003', 'round_of_32', 'Knockout Qualifier 5', 'Knockout Qualifier 6', '2026-06-29T16:00:00.000Z', 'scheduled', 1.2),
('R32_004', 'round_of_32', 'Knockout Qualifier 7', 'Knockout Qualifier 8', '2026-06-29T16:00:00.000Z', 'scheduled', 1.2),
('R32_005', 'round_of_32', 'Knockout Qualifier 9', 'Knockout Qualifier 10', '2026-06-30T16:00:00.000Z', 'scheduled', 1.2),
('R32_006', 'round_of_32', 'Knockout Qualifier 11', 'Knockout Qualifier 12', '2026-06-30T16:00:00.000Z', 'scheduled', 1.2),
('R32_007', 'round_of_32', 'Knockout Qualifier 13', 'Knockout Qualifier 14', '2026-07-01T16:00:00.000Z', 'scheduled', 1.2),
('R32_008', 'round_of_32', 'Knockout Qualifier 15', 'Knockout Qualifier 16', '2026-07-01T16:00:00.000Z', 'scheduled', 1.2),
('R32_009', 'round_of_32', 'Knockout Qualifier 17', 'Knockout Qualifier 18', '2026-07-02T16:00:00.000Z', 'scheduled', 1.2),
('R32_010', 'round_of_32', 'Knockout Qualifier 19', 'Knockout Qualifier 20', '2026-07-02T16:00:00.000Z', 'scheduled', 1.2),
('R32_011', 'round_of_32', 'Knockout Qualifier 21', 'Knockout Qualifier 22', '2026-07-03T16:00:00.000Z', 'scheduled', 1.2),
('R32_012', 'round_of_32', 'Knockout Qualifier 23', 'Knockout Qualifier 24', '2026-07-03T16:00:00.000Z', 'scheduled', 1.2),
('R32_013', 'round_of_32', 'Knockout Qualifier 25', 'Knockout Qualifier 26', '2026-07-04T16:00:00.000Z', 'scheduled', 1.2),
('R32_014', 'round_of_32', 'Knockout Qualifier 27', 'Knockout Qualifier 28', '2026-07-04T16:00:00.000Z', 'scheduled', 1.2),
('R32_015', 'round_of_32', 'Knockout Qualifier 29', 'Knockout Qualifier 30', '2026-07-05T16:00:00.000Z', 'scheduled', 1.2),
('R32_016', 'round_of_32', 'Knockout Qualifier 31', 'Knockout Qualifier 32', '2026-07-05T16:00:00.000Z', 'scheduled', 1.2),

-- ROUND OF 16 (8 Matches)
('R16_001', 'round_of_16', 'Winner R32_001', 'Winner R32_002', '2026-07-06T16:00:00.000Z', 'scheduled', 1.5),
('R16_002', 'round_of_16', 'Winner R32_003', 'Winner R32_004', '2026-07-06T16:00:00.000Z', 'scheduled', 1.5),
('R16_003', 'round_of_16', 'Winner R32_005', 'Winner R32_006', '2026-07-07T16:00:00.000Z', 'scheduled', 1.5),
('R16_004', 'round_of_16', 'Winner R32_007', 'Winner R32_008', '2026-07-07T16:00:00.000Z', 'scheduled', 1.5),
('R16_005', 'round_of_16', 'Winner R32_009', 'Winner R32_010', '2026-07-08T16:00:00.000Z', 'scheduled', 1.5),
('R16_006', 'round_of_16', 'Winner R32_011', 'Winner R32_012', '2026-07-08T16:00:00.000Z', 'scheduled', 1.5),
('R16_007', 'round_of_16', 'Winner R32_013', 'Winner R32_014', '2026-07-09T16:00:00.000Z', 'scheduled', 1.5),
('R16_008', 'round_of_16', 'Winner R32_015', 'Winner R32_016', '2026-07-09T16:00:00.000Z', 'scheduled', 1.5),

-- QUARTER FINALS (4 Matches)
('QF_001', 'quarter_final', 'Winner R16_001', 'Winner R16_002', '2026-07-10T16:00:00.000Z', 'scheduled', 2.0),
('QF_002', 'quarter_final', 'Winner R16_003', 'Winner R16_004', '2026-07-10T16:00:00.000Z', 'scheduled', 2.0),
('QF_003', 'quarter_final', 'Winner R16_005', 'Winner R16_006', '2026-07-11T16:00:00.000Z', 'scheduled', 2.0),
('QF_004', 'quarter_final', 'Winner R16_007', 'Winner R16_008', '2026-07-11T16:00:00.000Z', 'scheduled', 2.0),

-- SEMI FINALS (2 Matches)
('SF_001', 'semi_final', 'Winner QF_001', 'Winner QF_002', '2026-07-12T16:00:00.000Z', 'scheduled', 3.0),
('SF_002', 'semi_final', 'Winner QF_003', 'Winner QF_004', '2026-07-12T16:00:00.000Z', 'scheduled', 3.0),

-- THIRD PLACE (1 Match)
('TP_001', 'third_place', 'Loser SF_001', 'Loser SF_002', '2026-07-13T16:00:00.000Z', 'scheduled', 2.5),

-- FINAL (1 Match)
('F_001', 'final', 'Winner SF_001', 'Winner SF_002', '2026-07-13T16:00:00.000Z', 'scheduled', 5.0);
