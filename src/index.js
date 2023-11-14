const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { validatePath } = require("./utils");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Creating buckets directory
const bucketsDir = path.join(__dirname, "buckets");
fs.mkdirSync(bucketsDir, { recursive: true });

// List buckets
app.get("/buckets", (req, res) => {
  const buckets = fs.readdirSync(bucketsDir);
  res.json({ buckets });
});

// Create bucket
app.post("/buckets/:bucket", (req, res) => {
  const bucketName = req.params.bucket;
  const bucketPath = path.join(bucketsDir, bucketName);
  try {
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath);
      res.status(201).send(`Bucket '${bucketName}' created successfully.`);
    } else {
      res.status(400).send(`Bucket '${bucketName}' already exists.`);
    }
  } catch (e) {
    console.error(e);
  }
});

// List objects in a bucket
app.get("/buckets/:bucket/objects", (req, res) => {
  const bucketName = req.params.bucket;
  const bucketPath = path.join(bucketsDir, bucketName);
  try {
    if (fs.existsSync(bucketPath)) {
      const objects = fs.readdirSync(bucketPath);
      res.json({ objects });
    } else {
      res.status(404).send(`Bucket '${bucketName}' not found.`);
    }
  } catch (e) {
    console.error(e);
  }
});

// Get object from a bucket
app.get("/buckets/:bucket/objects/*", (req, res) => {
  const bucketName = req.params.bucket;
  const bucketPath = path.join(bucketsDir, bucketName);
  const objectName = req.params["0"];
  const objectPath = path.join(bucketsDir, bucketName, objectName);
  try {
    if (fs.existsSync(bucketPath)) {
      if (fs.existsSync(objectPath)) {
        const objectContent = fs.readFileSync(objectPath, "utf-8");
        res.send(objectContent);
      } else {
        res
          .status(404)
          .send(`Object '${objectName}' not found in bucket '${bucketName}'.`);
      }
    } else {
      res.status(404).send(`Bucket '${bucketName}' not found.`);
    }
  } catch (e) {
    res.status(404).send("Please enter valid or complete path");
    console.error(e.message);
  }
});

// Put object to a bucket
app.put("/buckets/:bucket/objects/*", (req, res) => {
  const bucketName = req.params.bucket;
  const bucketPath = path.join(bucketsDir, bucketName);
  const objectName = req.params["0"];
  const validatePaths = validatePath(objectName);
  // console.log(validatePaths);
  try {
    if (validatePaths.isValid) {
      if (validatePaths.singleElement) {
        const objectPath = path.join(bucketsDir, bucketName, objectName);
        if (fs.existsSync(bucketPath)) {
          fs.writeFileSync(objectPath, JSON.stringify(req.body));
          res
            .status(201)
            .send(`Object '${objectName}' added to bucket '${bucketName}'.`);
        } else {
          res.status(404).send(`Bucket '${bucketName}' not found.`);
        }
      } else {
        let newPath = bucketPath;

        for (let i = 0; i < validatePaths.folders.length; i++) {
          // console.log(newPath);
          newPath = path.join(newPath, validatePaths.folders[i]);
          fs.mkdirSync(newPath);
        }
        const objectPath = path.join(newPath, validatePaths.files);
        if (fs.existsSync(bucketPath)) {
          fs.writeFileSync(objectPath, JSON.stringify(req.body));
          res
            .status(201)
            .send(`Object '${objectName}' added to bucket '${bucketName}'.`);
        } else {
          res.status(404).send(`Bucket '${bucketName}' not found.`);
        }
      }
    } else {
      res.status(404).send("Please enter valid path");
    }
  } catch (e) {
    res.status(404).send(e.message);
    console.error(e);
  }
});

// Delete object from a bucket
app.delete("/buckets/:bucket/objects/*", (req, res) => {
  const bucketName = req.params.bucket;
  const bucketPath = path.join(bucketsDir, bucketName);
  const objectName = req.params["0"];
  const objectPath = path.join(bucketsDir, bucketName, objectName);
  try {
    if (fs.existsSync(bucketPath)) {
      if (fs.existsSync(objectPath)) {
        fs.unlinkSync(objectPath);
        res.send(`Object '${objectName}' deleted from bucket '${bucketName}'.`);
      } else {
        res
          .status(404)
          .send(`Object '${objectName}' not found in bucket '${bucketName}'.`);
      }
    } else {
      res.status(404).send(`Bucket '${bucketName}' not found.`);
    }
  } catch (e) {
    res.status(404).send("Please enter valid or complete path");
    console.error(e.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
