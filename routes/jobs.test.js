"use strict"

const request = require("supertest")
const db = require("../db")
const app = require("../app")
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
} = require("./_testCommon");
const { compareSync } = require("bcrypt");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)


describe("GET / jobs",function(){
    test("test for retrieve job list",async function(){
        const result = await request(app).get('/jobs')
        expect(result.statusCode).toBe(200)
        expect(result.body.jobs.length).toBe(3)
    })
})


describe("GET /:title jobs",function(){
    test("test for retrieve single job",async function(){
        const result = await request(app).get('/jobs/c1')
        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({
            title: 'c1', salary: 1, equity: '1', company_handle: 'c1'
        })
    })
})

describe("POST / jobs",function(){
    const job = {
        title:"hello",
        salary:1,
        equity:"1",
        company_handle:"c1"
    }

    const job1 = {
        salary:1,
        equity:"1",
        company_handle:"c1"
    }
    test("test for create new job with admin",async function(){
        const result = await request(app)
        .post('/jobs')
        .send(job)
        .set("authorization", `Bearer ${u2Token}`);

        expect(result.statusCode).toBe(201)
    })

    test("test for create new job without admin",async function(){
        const result = await request(app)
        .post('/jobs')
        .send(job)
        expect(result.statusCode).toBe(401)
    })

    test("create job without title",async ()=>{
        const result = await request(app)
        .post('/jobs')
        .send(job1)
        .set("authorization", `Bearer ${u2Token}`)
        expect(result.statusCode).toBe(400)
    })
})

describe("PATCH /:title",function(){
    const obj = {
        title:"c2",
        salary:1,
        equity:"1",
        company_handle:"c2"
    }

    const obj1 = {
        salary:1,
        equity:"1",
        company_handle:"c2"
    }
    test("update a job",async function(){
        const result = await request(app)
        .patch("/jobs/c1")
        .send(obj)
        .set("authorization", `Bearer ${u2Token}`)

        expect(result.statusCode).toBe(200)
        expect(result.body).toEqual({
            updated: { title: 'c2', salary: 1, equity: '1', company_handle: 'c2' }
        })
    })

    test("update with un-auth",async function(){
        const result = await request(app)
        .patch("/jobs/c1")
        .send(obj)
        expect(result.statusCode).toBe(401)
    })

    test("update without title",async function(){
        const result = await request(app)
        .patch("/jobs/c2")
        .send(obj1)
        .set("authorization", `Bearer ${u2Token}`)

        expect(result.statusCode).toBe(400)
    })
})

describe("DELETE /jobs",function(){
    test("test delete job",async function(){
        const result = await request(app)
        .delete("/jobs/c1")
        .set("authorization", `Bearer ${u2Token}`)

        const _job = await db.query(
            `SELECT title FROM jobs`
        );

        const jobs = _job.rows

        expect(result.statusCode).toBe(200)
        expect(jobs.length).toBe(2)
        
    })
})
