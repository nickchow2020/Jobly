const express = require("express")
const Job = require("../models/job")
const jsonSchema = require("jsonschema")
const jobSchema = require("../schemas/addJob.json")
const {BadRequestError} = require("../expressError")
const { ensureIsAdmin,
        ensureLoggedIn,
        ensureIsOwnerOrAdmin } = require("../middleware/auth")

const router= express.Router()

router.get("/",async (req,res,next)=>{
    try{
        const jobs = await Job.findAll(req.query)
        return res.json({jobs})
    }catch(e){
        return next(e)
    }
})


router.get("/:title",async (req,res,next)=>{
    try{
        const title = req.params.title;
        const job = await Job.get(title)
        return res.json(job)
    }catch(e){
        return next(e)
    }
})


router.post("/",ensureLoggedIn,ensureIsAdmin,async (req,res,next)=>{
    try{
        const validator = jsonSchema.validate(req.body,jobSchema)
        if(!validator.valid){
            const error = validator.errors.map(e => e.stack)
            throw new BadRequestError(error)
        }
        const job = await Job.create(req.body)
        return res.status(201).json({job})
    }catch(e){
        return next(e)
    }
})

router.patch("/:title",ensureLoggedIn,ensureIsAdmin,async (req,res,next)=>{
    try{
        const validator = jsonSchema.validate(req.body,jobSchema)
        if(!validator.valid){
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }

        const result = await Job.update(req.params.title,req.body)
        return res.json({updated:result})
    }catch(e){
        return next(e)
    }
})


router.delete("/:title",ensureLoggedIn,ensureIsAdmin,async (req,res,next)=>{
    try{
        const result = await Job.remove(req.params.title)
        return res.json({deleted:"done"})
    }catch(e){
        return next(e)
    }
})





module.exports = router