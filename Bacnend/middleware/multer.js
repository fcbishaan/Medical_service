import multer from "multer";
const storage = multer.diskStorage({
    __filename: function(req, file, callback){
        callback(null,file.originalname)
    }
})

const uplaod = multer({storage})

export default uplaod