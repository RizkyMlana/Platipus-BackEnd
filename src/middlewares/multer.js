import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype !== "application/pdf"){
            return cb(new Error("Only pdf"), false);
        }
        cb(null, true);
    },
});

export default upload;