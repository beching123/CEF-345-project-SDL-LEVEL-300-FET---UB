const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from server.js

describe('NETLINK Issues API', () => {
    test("GET /api/issues returns all issues", async () => {
        const res = await request (app).get('/api/issues');
        expect(res.statusCode).toBe(200);
    });
});