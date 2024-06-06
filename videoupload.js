require('dotenv').config();

const AWS = require('aws-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const videoupload = express();
const port = 3000;

// AWS SDKの設定
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// アップロードの設定
const uploadDir = process.env.UPLOAD_DIR || '/interviewVideo';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

videoupload.post('/interviewVideo', upload.single('file'), (req, res) => {
    const filePath = path.join(uploadDir, req.file.filename);
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: req.file.filename,
        Body: fileContent,
        ContentType: req.file.mimetype
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.error('Error uploading file to S3:', error);
            res.status(500).send(error);
            return;
        }

        console.log('File uploaded successfully to S3:', data.Location);
        res.send('File uploaded successfully to S3');
    });
});

videoupload.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = videoupload;