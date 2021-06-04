"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Create a job (from data), update db, return new job data.
   *
   * data should be { title,salary,equity,company_handle }
   *
   * Returns { title,salary,equity,company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

    static async create({title,salary,equity,company_handle}) {
    const duplicateCheck = await db.query(
            `SELECT title
            FROM jobs
            WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
        throw new BadRequestError(`Duplicate company: ${title}`);

    const result = await db.query(
            `INSERT INTO jobs
            (title,salary,equity,company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title,salary,equity,company_handle`,
        [
            title,
            salary,
            equity,
            company_handle,
        ],
    );
    const job = result.rows[0];

    return job;
    }

    /** Find all jobs.
   *
   * Returns [{ title,salary,equity,company_handle }, ...]
   * */

    static async findAll({title,minSalary,hasEquity}) {

    // initial identifier value to empty array
    let identifierValue = []
    
    // query template
    let query = 
    `SELECT 
    title,
    salary,
    equity,
    company_handle
    FROM jobs`

    //when filter only with title
    if(title && !minSalary && !hasEquity){
        query += ` WHERE lower(title) ILIKE $1 `
        identifierValue[0] = `%${title.toLowerCase()}%`
    }
    //when filter only with salary
    if(minSalary && !title && !hasEquity){
        query += ` WHERE salary >= $1`
        identifierValue[0] = minSalary
    }
    //when filter with equity
    if(hasEquity && !title & !minSalary){
        query += ` WHERE equity > 0`
        identifierValue.length = 0
    }
    //when filter with title,salary and equity
    if(title && minSalary && hasEquity){
        query += ` WHERE lower(title) ILIKE $1 AND salary > $2 AND equity > 0`
        identifierValue[0] = `%${title.toLowerCase()}%`
        identifierValue[1] = minSalary
    }

    //when filter with title and salary
    if(title && minSalary && !hasEquity){
        query += ` WHERE lower(title) ILIKE $1 AND salary > $2`
        identifierValue[0] = `%${title.toLowerCase()}%`
        identifierValue[1] = minSalary
    }

    //when filter with title and equity
    if(title && hasEquity && !minSalary){
        query += ` WHERE lower(title) ILIKE $1 AND equity > 0`
        identifierValue[0] = `%${title.toLowerCase()}%`
    }

    //final query
    const jobs = await db.query(
        query,identifierValue
    )
    return jobs.rows;
    }

    /** Given a job title, return data about job.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

    static async get(title) {
    const result = await db.query(
            `SELECT title,
                salary,
                equity,
                company_handle
            FROM jobs
            WHERE title = $1`,
        [title]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
    }

    /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title,salary,equity,company_handle}
   *
   * Returns {title,salary,equity,company_handle}
   *
   * Throws NotFoundError if not found.
   */

    static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE title = ${handleVarIdx} 
                        RETURNING title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job id found: ${title}`);

    return job;
    }

    /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

static async remove(title) {
    const result = await db.query(
            `DELETE
            FROM jobs
            WHERE title = $1
            RETURNING id`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job title: ${title}`);
    }
}


module.exports = Job;
