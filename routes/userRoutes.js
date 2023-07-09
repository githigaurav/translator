const express=require('express')
const router=express.Router()


const {fileUpload,fileValidation}=require('../middleware/middleware.js') 

const {extractData,audioTest}=require('../controllers/userControllers.js')



// home routes
router.get('/',(req, res)=>{
    res.render('index.ejs')
})

// translate routes
router.post('/translate',fileUpload,fileValidation,(req, res)=>{
    extractData(req, res)

})



 module.exports=router;
