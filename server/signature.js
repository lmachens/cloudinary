const Future = Npm.require("fibers/future");

Meteor.methods({
  "c.sign"(ops) {
    if (ops == null) {
      ops = {};
    }
    check(ops, Match.Optional(Object));
    this.unblock();

    if (Cloudinary.rules.signature) {
      this.options = ops;
      const auth_function = _.bind(Cloudinary.rules.signature, this);
      if (!auth_function()) {
        throw new Meteor.Error("Unauthorized", "Signature not allowed");
      }
    }

    // Need to add some way to do custom auth
    // signature = Cloudinary.utils.sign_request ops
    const signature = Cloudinary.uploader.direct_upload("", ops); // This is better than utils.sign_request, it returns a POST url as well and properly manages optional parameters

    return signature;
  },


  "c.delete_by_public_id"(public_id, type) {
    let ops;
    check(public_id, String);
    check(type, Match.OneOf(String, undefined, null));
    this.unblock();

    if (Cloudinary.rules.delete) {
      this.public_id = public_id;
      const auth_function = _.bind(Cloudinary.rules.delete, this);
      if (!auth_function()) {
        throw new Meteor.Error("Unauthorized", "Delete not allowed");
      }
    }

    if (type) {
      ops =
        {type};
    }

    const future = new Future();

    Cloudinary.api.delete_resources([public_id], result => future.return(result)
      , ops);

    return future.wait();
  },

  "c.get_private_resource"(public_id, ops) {
    if (ops == null) {
      ops = {};
    }
    check(public_id, String);
    check(ops, Match.Optional(Object));
    this.unblock();

    _.extend(ops, {
        sign_url: true,
        type: "private"
      }
    );

    if (Cloudinary.rules.private_resource) {
      this.public_id = public_id;
      const auth_function = _.bind(Cloudinary.rules.private_resource, this);
      if (!auth_function()) {
        throw new Meteor.Error("Unauthorized", "Access not allowed");
      }
    }


    return Cloudinary.url(public_id, ops);
  },

  "c.get_download_url"(public_id, ops) {
    if (ops == null) {
      ops = {};
    }
    check(public_id, String);
    check(ops, Match.Optional(Object));
    this.unblock();

    if (Cloudinary.rules.download_url) {
      this.public_id = public_id;
      const auth_function = _.bind(Cloudinary.rules.download_url, this);
      if (!auth_function()) {
        throw new Meteor.Error("Unauthorized", "Access not allowed");
      }
    }

    const format = ops.format || "";

    return Cloudinary.utils.private_download_url(public_id, format, _.omit(ops, "format"));
  }
});



