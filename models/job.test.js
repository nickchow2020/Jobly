"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("TEST FOR CREATE JOB",function(){
    test("CREATE JOB",async function(){
            const job = {
                title:"c4",
                salary:1,
                equity:"1",
                company_handle:'c1'
            }

        const newJob = await Job.create(job)
        expect(newJob).toEqual(job)
    })

    test("CREATE JOB with DUPLICATE title",async function(){
        const job1 = {
            title:"c1",
            salary:1,
            equity:"1",
            company_handle:'c1'
        }

        const job2 = {
            title:"c1",
            salary:2,
            equity:"2",
            company_handle:'c1'
        }

    try{
        await Job.create(job1)
        await Job.create(job2)
    }catch(e){
        expect(e instanceof BadRequestError).toBeTruthy()
    }
})
})


describe("TESTING FOR GET JOB LIST",function(){
    const job1 = {
        title:"c1",
        salary:1,
        equity:"1",
        company_handle:'c1'
    }

    const job2 = {
        title:"c2",
        salary:2,
        equity:"1",
        company_handle:'c2'
    }

    const job3 = {
        title:"hello",
        salary:2,
        equity:"1",
        company_handle:'c1'
    }

    const job4 = {
        title:"world",
        salary:2,
        equity:"0",
        company_handle:'c1'
    }
    test("TESTING GET JOB LIST",async ()=>{
        const allJobs = await Job.findAll({})
        expect(allJobs).toEqual([
            job1,job2,job3,job4
        ])
    })

    test("testing filter title",async ()=>{
        const results = await Job.findAll({title:"he"})
        const results1 = await Job.findAll({title:"or"})
        const job3 = {
            title:"hello",
            salary:2,
            equity:"1",
            company_handle:'c1'
        }
    
        const job4 = {
            title:"world",
            salary:2,
            equity:"0",
            company_handle:'c1'
        }

        expect(results).toEqual([job3])
        expect(results1).toEqual([job4])
    })

    test("testing filter with salary", async ()=>{
        const results = await Job.findAll({minSalary:2})
        const results1 = await Job.findAll({minSalary:1})
        expect(results.length).toBe(3)
        expect(results1.length).toBe(4)
    })

    test("testing fitter with equity", async ()=>{
        const results = await Job.findAll({hasEquity:true})
        expect(results.length).toBe(3)
    })
})


describe("TESTING FOR GET JOB",function(){
    const job1 = {
        title:"c1",
        salary:1,
        equity:"1",
        company_handle:'c1'
    }

    test("TESTING GET JOB",async ()=>{
        const job = await Job.get("c1")
        expect(job).toEqual(job1)
    })
})


describe("TESTING FOR UPDATE JOB",function(){
    test("TESTING GET JOB",async ()=>{
        const update = {
            title:"c1",
            salary:2,
            equity:"1",
            company_handle:'c2'
        }

        const update1 = {
            title:"love"
        }

        const job = await Job.update("c1",update)
        expect(job).toEqual(update)

        const _job = await Job.update("c1",update1)
        expect(_job).toEqual({
            title:"love",
            salary:2,
            equity:"1",
            company_handle:'c2'
        })
    })
})


describe("TESTING FOR DELETE JOB",function(){

    test("TESTING DELETE JOB",async ()=>{
        const job = await Job.remove("c1")
        const response = await db.query(`SELECT title FROM jobs`)
        expect(response.rows.length).toEqual(3)
    })
})