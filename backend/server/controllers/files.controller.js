import upload from '../services/files.service';
import APIError from '../helpers/APIError';

const uploadAny = upload.any();

async function uploadFile(req, res, next) {
  uploadAny(req, res, function (err) {
    if (err) {
      next(new APIError(`Upload file failed: ${err}`, 400, true));
    }
    return res.json(req.files);
  });
}

export default { uploadFile };
