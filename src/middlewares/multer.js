import multer from "multer";

const storage = multer.memoryStorage();

export const uploadProposal = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    },
});

export const uploadEventAssets = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "image" &&
      !file.mimetype.startsWith("image/")
    ) {
      return cb(new Error("Event image must be an image"));
    }

    if (
      file.fieldname === "proposal" &&
      file.mimetype !== "application/pdf"
    ) {
      return cb(new Error("Proposal must be PDF"));
    }

    cb(null, true);
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "proposal", maxCount: 1 },
]);

export const uploadImage = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if(!allowed.includes(file.mimetype)) {
            return cb(new Error("Only Images Kids"));
        }

        cb(null, true);
    }

})

export const uploadEvent = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if(!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only Image Kids"));
        }
        cb(null, true);
    }
})

