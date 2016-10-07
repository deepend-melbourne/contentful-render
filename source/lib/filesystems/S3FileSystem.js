import FileSystem from '../FileSystem'
import Promise from 'bluebird'
import path from 'path'
import AWS from 'aws-sdk'



class S3FileSystem extends FileSystem {
  constructor(config) {
    super()

    this.config = config

    this.s3 = Promise.promisifyAll(new AWS.S3())
  }

  translatePath(filePath) {
    return path.join(this.config.destPath, filePath).replace(/^(\/+)/, '').replace(/(\/{2,})/g, '/')
  }

  read(filePath, params) {
    const getObjectConfig = {
      Key: this.translatePath(filePath),
      Bucket: this.config.bucket,
      ...params
    }

    return this.s3.getObjectAsync(getObjectConfig)
      .then(result => result.Body.toString('utf8'))
  }

  write(filePath, content, params) {
    const putObjectConfig = {
      ACL: 'public-read',
      Bucket: this.config.bucket,
      Key: this.translatePath(filePath),
      Body: content,
      ContentType: 'text/html',
      ...params
    }

    return this.s3.putObjectAsync(putObjectConfig)
  }

  delete(filePath) {
    const deleteObjectConfig = {
      Bucket: this.config.bucket,
      Key: this.translatePath(filePath)
    }

    return this.s3.deleteObjectAsync(putObjectConfig)
  }
}

export default S3FileSystem
