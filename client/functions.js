const cloudinary = require('cloudinary-core');

const cl = cloudinary.Cloudinary.new();

Cloudinary = {
  collection: new Mongo.Collection('_cloudinary', { connection: null }),
  _private_urls: {},
  _expiring_urls: {},
  xhr: null,
  config(options) {
    return cl.config(options);
  },
  url(public_id, options) {
    if (public_id && !_.isEmpty(public_id)) {
      return cl.url(public_id, options);
    }
  },

  private_url(public_id, options) {
    let private_url = Cloudinary._private_urls[public_id];
    if (!private_url) {
      Cloudinary._private_urls[public_id] = new ReactiveVar('');
      private_url = Cloudinary._private_urls[public_id];
    }

    if (public_id && !_.isEmpty(public_id) && _.isEmpty(private_url.get())) {
      Meteor.call('c.get_private_resource', public_id, options.hash, function(error, result) {
        if (error) {
          throw new Meteor.Error('Cloudinary', 'Failed to sign and fetch image');
        } else {
          return private_url.set(result);
        }
      });
    }

    return private_url.get();
  },

  expiring_url(public_id, options) {
    let expiring_url = Cloudinary._expiring_urls[public_id];
    if (!expiring_url) {
      Cloudinary._expiring_urls[public_id] = new ReactiveVar('');
      expiring_url = Cloudinary._expiring_urls[public_id];
    }

    if (public_id && !_.isEmpty(public_id) && _.isEmpty(expiring_url.get())) {
      Meteor.call('c.get_download_url', public_id, options.hash, function(error, result) {
        if (error) {
          throw new Meteor.Error('Cloudinary', 'Failed to sign and fetch image');
        } else {
          return expiring_url.set(result);
        }
      });
    }

    return expiring_url.get();
  },

  delete(public_id, type, callback) {
    if (_.isFunction(type)) {
      callback = type;
      type = undefined;
    }

    return Meteor.call('c.delete_by_public_id', public_id, type, function(error, result) {
      if (error) {
        return callback && callback(error, null);
      } else {
        if (result.deleted[public_id] && result.deleted[public_id] === 'not_found') {
          return callback && callback(result, null);
        } else {
          return callback && callback(null, result);
        }
      }
    });
  },

  upload(files, ops, callback) {
    let reader;
    if (ops == null) {
      ops = {};
    }
    if (_.isFunction(ops)) {
      callback = ops;
      ops = {};
    }

    if (files instanceof File || files instanceof Blob) {
      const file = files;
      reader = new FileReader();

      reader.onload = () => Cloudinary._upload_file(reader.result, ops, callback);

      return reader.readAsDataURL(file);
    }

    if (_.isArray(files) || files instanceof FileList) {
      return _.each(files, function(file) {
        reader = new FileReader();

        reader.onload = () => Cloudinary._upload_file(reader.result, ops, callback);

        return reader.readAsDataURL(file);
      });
    }
  },

  _upload_file(file, ops, callback) {
    if (ops == null) {
      ops = {};
    }
    return Meteor.call('c.sign', ops, function(error, result) {
      if (error) {
        return callback && callback(error, null);
      }

      // Build form
      const form_data = new FormData();
      _.each(result.hidden_fields, (v, k) => form_data.append(k, v));

      form_data.append('file', file);

      // Create collection document ID
      const collection_id = Random.id();

      // Send data
      Cloudinary.xhr = new XMLHttpRequest();

      Cloudinary.collection.insert({
        _id: collection_id,
        status: 'uploading',
        preview: file
      });

      Cloudinary.xhr.upload.addEventListener(
        'progress',
        event =>
          Cloudinary.collection.update(
            { _id: collection_id },
            {
              $set: {
                loaded: event.loaded,
                total: event.total,
                percent_uploaded: Math.floor((event.loaded / event.total) * 100)
              }
            }
          ),

        false
      );

      Cloudinary.xhr.addEventListener('load', function() {
        let response;
        if (Cloudinary.xhr.status < 400) {
          response = JSON.parse(this.response);
          Cloudinary.collection.upsert(collection_id, {
            $set: {
              status: 'complete',
              percent_uploaded: 100,
              response
            }
          });

          return callback && callback(null, response);
        } else {
          response = JSON.parse(this.response);
          Cloudinary.collection.upsert(collection_id, {
            $set: {
              status: 'error',
              response
            }
          });

          return callback && callback(response, null);
        }
      });

      Cloudinary.xhr.addEventListener('error', function() {
        const response = JSON.parse(this.response);
        Cloudinary.collection.upsert(collection_id, {
          $set: {
            status: 'error',
            response
          }
        });

        return callback && callback(response, null);
      });

      Cloudinary.xhr.addEventListener('abort', () =>
        Cloudinary.collection.upsert(collection_id, {
          $set: {
            status: 'aborted'
          }
        })
      );

      Cloudinary.xhr.open('POST', result.form_attrs.action, true);

      return Cloudinary.xhr.send(form_data);
    });
  }
};
