"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
            FROM companies
            WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
            (handle, name, description, num_employees, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll({name,minEmployees,maxEmployees}) {

    // initial identifier value to an empty array
    let identifierValue = []

    // query template
    let query = 
    `SELECT handle,
    name,
    description,
    num_employees AS "numEmployees",
    logo_url AS "logoUrl"
    FROM companies`

    //query only with name 
    if(name && !minEmployees && !maxEmployees){
      query += ` WHERE lower(name) ILIKE $1`
      identifierValue[0] = `%${name.toLowerCase()}%`
    }
    // query with name,min,and max employees
    if(name && minEmployees && maxEmployees){
      query += ` WHERE lower(name) ILIKE $1 and num_employees > $2 and num_employees < $3`
      identifierValue[0] = `%${name.toLowerCase()}%`
      identifierValue[1] = `${minEmployees}`
      identifierValue[2] = `${maxEmployees}`
    }

    // query with name and min employees
    if(name && minEmployees && !maxEmployees){
      query += ` WHERE lower(name) ILIKE $1 and num_employees > $2`
      identifierValue[0] = `%${name.toLowerCase()}%`
      identifierValue[1] = `${minEmployees}`
    }

    //query with name and max employees
    if(name && maxEmployees && !minEmployees){
      query += ` WHERE lower(name) ILIKE $1 and num_employees < $2`
      identifierValue[0] = `%${name.toLowerCase()}%`
      identifierValue[1] = `${maxEmployees}`
    }

    //query with min employee only
    if(minEmployees && !maxEmployees && !name){
      query += ` WHERE num_employees > $1`
      identifierValue[0] = `${minEmployees}`
    }

    //query with max employee only
    if(maxEmployees && !minEmployees && !name){
      query += ` WHERE num_employees < $1`
      identifierValue[0] = `${maxEmployees}`
    }

    //query with min and max employee
    if(minEmployees && maxEmployees && !name){
      query += ` WHERE num_employees > $1 and num_employees < $2`
      identifierValue[0] = `${minEmployees}`
      identifierValue[1] = `${maxEmployees}`
    }

    query  += ` ORDER BY name`
    const companiesRes = await db.query(
      query,identifierValue
    )
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
            FROM companies
            WHERE handle = $1
            RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }


  /** given company handle from database; returns list of jobs.
   *
   * Throws NotFoundError if company not found.
   **/
  static async getAllJobs(handle){
      const result = await db.query(
        `SELECT id,title,salary,equity FROM jobs WHERE company_handle = $1`
        ,[handle]
      )
      return result.rows
  }
}


module.exports = Company;
