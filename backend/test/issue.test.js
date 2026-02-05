const request = require('supertest');
const app = require('../app');

// Mock the database module
jest.mock('mysql2', () => {
  return {
    createPool: jest.fn(() => ({
      query: jest.fn((sql, values, callback) => {
        // Mock different responses based on the SQL
        if (sql.includes('SELECT')) {
          callback(null, [
            {
              id: 1,
              network_type: 'MTN',
              phone: '678901234',
              issue: 'slow-speed',
              description: 'Internet is very slow',
              location_allowed: 1,
              created_at: '2026-02-04T10:00:00Z'
            }
          ]);
        } else if (sql.includes('INSERT')) {
          callback(null, { insertId: 1, affectedRows: 1 });
        } else {
          callback(null, []);
        }
      })
    }))
  };
});

describe('NETLINK Issues API', () => {
  // ========== POST /report Tests ==========
  describe('POST /report', () => {
    test('should accept valid MTN report and return 200', async () => {
      const validReport = {
        networkType: 'MTN',
        phone: '678901234',
        issue: 'slow-speed',
        description: 'Internet is very slow',
        locationAllowed: true
      };
      const res = await request(app)
        .post('/report')
        .send(validReport);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
    });

    test('should accept valid ORANGE report and return 200', async () => {
      const validReport = {
        networkType: 'ORANGE',
        phone: '691234567',
        issue: 'no-connection',
        description: 'No internet connection at all',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(validReport);
      expect(res.statusCode).toBe(200);
    });

    test('should accept valid CAMTEL report and return 200', async () => {
      const validReport = {
        networkType: 'CAMTEL',
        phone: '624201234',
        issue: 'call-drops',
        description: 'Calls dropping frequently',
        locationAllowed: true
      };
      const res = await request(app)
        .post('/report')
        .send(validReport);
      expect(res.statusCode).toBe(200);
    });

    test('should reject invalid MTN phone number (wrong prefix)', async () => {
      const invalidReport = {
        networkType: 'MTN',
        phone: '691234567', // ORANGE prefix, not MTN
        issue: 'slow-speed',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(invalidReport);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Validation Failed');
    });

    test('should reject invalid ORANGE phone number', async () => {
      const invalidReport = {
        networkType: 'ORANGE',
        phone: '678901234', // MTN prefix, not ORANGE
        issue: 'no-connection',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(invalidReport);
      expect(res.statusCode).toBe(403);
    });

    test('should reject invalid CAMTEL phone number', async () => {
      const invalidReport = {
        networkType: 'CAMTEL',
        phone: '678901234', // Not CAMTEL format
        issue: 'call-drops',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(invalidReport);
      expect(res.statusCode).toBe(403);
    });

    test('should trim whitespace from phone number', async () => {
      const reportWithWhitespace = {
        networkType: 'MTN',
        phone: '  678901234  ', // With spaces
        issue: 'slow-speed',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(reportWithWhitespace);
      expect(res.statusCode).toBe(200);
    });

    test('should accept locationAllowed as false', async () => {
      const report = {
        networkType: 'MTN',
        phone: '678901234',
        issue: 'slow-speed',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(report);
      expect(res.statusCode).toBe(200);
    });

    test('should return success status on valid submission', async () => {
      const report = {
        networkType: 'MTN',
        phone: '678901234',
        issue: 'slow-speed',
        description: 'Test description',
        locationAllowed: true
      };
      const res = await request(app)
        .post('/report')
        .send(report);
      expect(res.body.status).toBe('success');
    });

    test('should handle all MTN prefix formats', async () => {
      const prefixes = ['67', '68', '650', '651', '652', '653', '654'];
      
      for (const prefix of prefixes) {
        const phone = prefix + '901234'.slice(0, 9 - prefix.length);
        const report = {
          networkType: 'MTN',
          phone: phone,
          issue: 'slow-speed',
          description: 'Test',
          locationAllowed: false
        };
        const res = await request(app)
          .post('/report')
          .send(report);
        expect(res.statusCode).toBe(200);
      }
    });

    test('should handle all ORANGE prefix formats', async () => {
      const prefixes = ['69', '655', '656', '657', '658', '659'];
      
      for (const prefix of prefixes) {
        const phone = prefix + '901234'.slice(0, 9 - prefix.length);
        const report = {
          networkType: 'ORANGE',
          phone: phone,
          issue: 'slow-speed',
          description: 'Test',
          locationAllowed: false
        };
        const res = await request(app)
          .post('/report')
          .send(report);
        expect(res.statusCode).toBe(200);
      }
    });
  });

  // ========== Validation Tests ==========
  describe('Phone Validation', () => {
    test('should reject phone number with letters', async () => {
      const report = {
        networkType: 'MTN',
        phone: '67890abc4',
        issue: 'slow-speed',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(report);
      expect(res.statusCode).toBe(403);
    });

    test('should reject phone number that is too short', async () => {
      const report = {
        networkType: 'MTN',
        phone: '6789',
        issue: 'slow-speed',
        description: 'Test',
        locationAllowed: false
      };
      const res = await request(app)
        .post('/report')
        .send(report);
      expect(res.statusCode).toBe(403);
    });
  });

  // ========== Content-Type Tests ==========
  describe('API Content-Type', () => {
    test('should accept JSON content-type', async () => {
      const res = await request(app)
        .post('/report')
        .set('Content-Type', 'application/json')
        .send({
          networkType: 'MTN',
          phone: '678901234',
          issue: 'slow-speed',
          description: 'Test',
          locationAllowed: true
        });
      expect([200, 403]).toContain(res.statusCode);
    });
  });
});