const { BadRequestError } = require("../expressError");
const {sqlForPartialUpdate} = require("./sql");


describe("Testing For Partial Update", function () {
    test("See if it works no need convert specific properties",function(){
        const body1 = {"name":"nick","age":"28"}
        const body2 = {"name":"nick","age":28}
        
        const updateObj = sqlForPartialUpdate(body1,{})
        expect(updateObj).toEqual(
        {
            setCols:'"name"=$1, "age"=$2',
            values:["nick","28"]
        })

        const updateObj1 = sqlForPartialUpdate(body2,{})
        expect(updateObj1).toEqual(
            {
                setCols:'"name"=$1, "age"=$2',
                values:["nick",28]
            }
        )
    })


    test("test with specific properties name changes",function(){
        const body1 = {"name":"nick","age":"28"}
        toSQL = {
            name:"full_name"
        }

        toSQL1 = {
            name:"full_name",
            age:"user_age"
        }

        const updateObj = sqlForPartialUpdate(body1,toSQL)

        expect(updateObj).toEqual(
            {
                setCols:'"full_name"=$1, "age"=$2',
                values:["nick","28"]
            }
        )

        const updateObj1 = sqlForPartialUpdate(body1,toSQL1)
        expect(updateObj1).toEqual({
            setCols:'"full_name"=$1, "user_age"=$2',
            values:["nick","28"]
        })
    })

    test("test for 404 no data error",()=>{ 
        expect(()=>sqlForPartialUpdate({},{})).toThrowError(BadRequestError)
        expect(()=>sqlForPartialUpdate({})).toThrowError(BadRequestError)
    })
})
