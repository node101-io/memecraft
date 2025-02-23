import crypto from 'crypto';

export const createPinataFormData = async (file) => {
  const base64Data = file.replace(/^data:image\/png;base64,/, '');
  const fileBuffer = Buffer.from(base64Data, 'base64');

  const randomName = crypto.randomBytes(8).toString('hex');
  const fileName = `${randomName}.png`;

  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

  const formParts = [];

  formParts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  formParts.push(fileBuffer);
  formParts.push('\r\n');

  formParts.push(
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="pinataMetadata"\r\n\r\n' +
    JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'image/png'
      }
    }) +
    '\r\n'
  );

  formParts.push(
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="pinataOptions"\r\n\r\n' +
    JSON.stringify({ cidVersion: 1 }) +
    '\r\n'
  );

  formParts.push(`--${boundary}--\r\n`);

  const formBody = Buffer.concat(
    formParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
  );

  return { boundary, formBody };
};
