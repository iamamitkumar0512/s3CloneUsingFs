const path = require("path");

function validatePath(pathToValidate) {
  const validPathRegex = /^[a-zA-Z0-9.\/]+$/;

  if (!validPathRegex.test(pathToValidate)) {
    return {
      isValid: false,
    };
  }

  const parts = pathToValidate.split("/");
  let isValid = true;
  const folders = [];
  let files = 1;
  let fileName = parts[parts.length - 1];

  if (parts.length === 1) {
    return {
      isValid: true,
      singleElement: true,
    };
  }

  for (let i = 0; i < parts.length - 1; i++) {
    if (path.extname(parts[i]) !== "") {
      // It's a file
      files++;
      isValid = false;
    } else {
      // It's a folder
      folders.push(parts[i]);
    }
  }
  //   console.log(files, folders, isValid);

  if (files > 1) {
    isValid = false; // More than one file in the path is invalid
  }

  if (isValid) {
    return {
      isValid: true,
      folders: folders,
      files: fileName,
      folderCount: folders.length,
      fileCount: files,
    };
  } else {
    return {
      isValid: false,
    };
  }
}

module.exports = { validatePath };
