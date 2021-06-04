const { BadRequestError } = require("../expressError");

/** 
 * Convert data from req.body to Match database Columns
 * @param {object} dataToUpdate - Object Data from req.body.
 * @param {object} jsToSql - Object of specific the properties need to convert to match to DB columns.
 * 
 * @returns {Object} - Has a property call setCols with a string of SET columns name and identifier for DB UPDATE
 * @returns {object} - has a property call values with a array of SET columns identifier values
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
