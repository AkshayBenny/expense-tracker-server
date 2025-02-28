import multer from 'multer'

// Store file in memory as a buffer, which we pass to Vision
const upload = multer({ storage: multer.memoryStorage() })

export default upload
