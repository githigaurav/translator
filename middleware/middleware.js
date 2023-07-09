const multer=require("multer")
const path=require("path")
const fs=require('fs')


const fileUpload = function(req, res, next){
 const filepath=path.join(__dirname,`./../upload`)

  const storage= multer.diskStorage({
    destination:function(req, file, cb){
      cb(null, filepath)
    },
    filename:function(req, file ,cb){
      cb(null, file.originalname)
    }
  })

  const fileFilter=function(req, file, cb){
    const allowedFormats = ['.pdf','.jpg','.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
   
      // Check if the file format is allowed
      if (allowedFormats.includes(fileExtension)) {
        cb(null, true); 
      } else {
        cb(new Error("Invalid file format. Only PDF and PNG files are allowed."), false);
      }
    
  }
  const upload = multer({storage:storage, fileFilter:fileFilter}).single('file')

  upload(req, res, function(err){
      if(err){
        const errhandle=`${err}`
        console.log(errhandle)
        res.status(400).json({message:"Invalid file format. Only PDF, JPG, and PNG files are allowed"})
        console.log(err  + '')
        
      }else{
        
        next()
      }
  })


}
// 
const fileValidation= function(req, res, next){
console.log(req.body)
  if(req.file){

    if(req.file!==undefined && req.file !==''){
      if(req.body.language!==''){
        next()
      }else{
        res.status(400).json({message:"Language  required"})
      }
    }else {
      res.status(400).json({message:"File required"})
    }
    
  }else if(req.body.reqUpdateText){

    if(req.body.updatelanguage!==undefined && req.body.updatelanguage!==''){
      res.sendStatus(200);
      next()
    }else{
      res.status(400).json({message:"Language  required"})
    }

  }
  else if(req.body.audio && req.body.audio !==undefined){

    next()
    
  }else{
    res.status(400).json({message:"File required"})
  }

}




module.exports={fileUpload, fileValidation}