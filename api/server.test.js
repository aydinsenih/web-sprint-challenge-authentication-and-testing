// Write your tests here
const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");

const user1 = { username: "admin", password: "admin" };
const user2 = { username: "user", password: "1234" };

test("sanity", () => {
    expect(true).toBe(true);
});

beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
});

beforeEach(async () => {
    await db("users").truncate();
});

afterAll(async () => {
    await db.destroy();
});

describe("[POST] /auth/register", () => {
    it("respond with 200 status code", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send(user1);
        expect(res.statusCode + "").toMatch(/20/);
    });
    it("respond with 400 status code due to username taken", async () => {
        await db("users").insert(user1);
        const res = await request(server)
            .post("/api/auth/register")
            .send(user1);
        expect(res.statusCode + "").toMatch(/40/);
    });
    it("respond with 400 status code due to lack of username or password", async () => {
        let res = await request(server)
            .post("/api/auth/register")
            .send({ username: "admin" });
        expect(res.statusCode + "").toMatch(/40/);
        res = await request(server)
            .post("/api/auth/register")
            .send({ password: "admin" });
        expect(res.statusCode + "").toMatch(/40/);
    });
});
describe("[POST] /auth/login", () => {
    beforeEach(async () => {
        await db("users").truncate();
        await request(server).post("/api/auth/register").send(user1);
    });
    it("respond with 200 status code", async () => {
        const res = await request(server).post("/api/auth/login").send(user1);
        expect(res.statusCode + "").toMatch(/20/);
    });
    it("respond with 400 status code due to lack of username or password", async () => {
        let res = await request(server)
            .post("/api/auth/login")
            .send({ username: "admin" });
        expect(res.statusCode + "").toMatch(/40/);
        res = await request(server)
            .post("/api/auth/login")
            .send({ password: "admin" });
        expect(res.statusCode + "").toMatch(/40/);
        res = await await request(server).post("/api/auth/login").send({});
        expect(res.statusCode + "").toMatch(/40/);
    });
});

describe("[GET] jokes", () => {
    let token;
    beforeEach(async () => {
        await db("users").truncate();
        await request(server).post("/api/auth/register").send(user1);
        const res = await request(server).post("/api/auth/login").send(user1);
        token = res.body.token;
    });
    it("respond with 200 status code", async () => {
        const res = await request(server)
            .get("/api/jokes")
            .set("Authorization", token);
        expect(res.statusCode + "").toMatch(/200/);
    });
    it("respond with 400 status code due to missing token", async () => {
        const res = await request(server).get("/api/jokes");
        expect(res.statusCode + "").toMatch(/4/);
    });
    it("respond with 400 status code due to invalid token", async () => {
        const res = await request(server).get("/api/jokes");
        expect(res.statusCode + "").toMatch(/4/);
    });
});
