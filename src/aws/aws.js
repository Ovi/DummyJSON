const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const { logError } = require('../helpers/logger');

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME, AWS_BUCKET_REGION } = process.env;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region: AWS_BUCKET_REGION,
});

const aws = {};

aws.uploadToStorage = async (buffer, contentType, key) => {
  try {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    const response = await s3Client.send(command);
    return response.$metadata;
  } catch (error) {
    return null;
  }
};

aws.verifyInStorage = async key => {
  try {
    const command = new HeadObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    return response?.$metadata?.httpStatusCode === 200;
  } catch (error) {
    return null;
  }
};

aws.getFromStorage = async key => {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    return Buffer.concat(await response.Body.toArray());
  } catch (error) {
    return null;
  }
};

aws.deleteFileFromStorage = async key => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    const res = await s3Client.send(command);
    return res;
  } catch (error) {
    return null;
  }
};

aws.deleteFolderFromStorage = async key => {
  try {
    return recursiveDelete(key);
  } catch (error) {
    return null;
  }
};

module.exports = aws;

async function recursiveDelete(location, token) {
  let count = 0; // number of files deleted

  // get the files
  const listCommand = new ListObjectsV2Command({
    Bucket: AWS_BUCKET_NAME,
    Prefix: location,
    ContinuationToken: token,
  });

  const list = await s3Client.send(listCommand);
  if (list.KeyCount) {
    // if items to delete
    // delete the files
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: AWS_BUCKET_NAME,
      Delete: {
        Objects: list.Contents.map(item => ({ Key: item.Key })),
        Quiet: false,
      },
    });

    const deleted = await s3Client.send(deleteCommand);
    count += deleted.Deleted.length;

    // log any errors deleting files
    if (deleted.Errors) {
      deleted.Errors.map(error => logError(`${error.Key} could not be deleted - ${error.Code}`));
    }
  }

  // repeat if more files to delete
  if (list.NextContinuationToken) {
    recursiveDelete(location, list.NextContinuationToken);
  }
  // return total deleted count when finished
  return `${count} files deleted.`;
}
