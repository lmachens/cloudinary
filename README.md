# Fork
This package based on [lepozepo:cloudinary](https://github.com/Lepozepo/cloudinary).
It has no Blaze template helpers and templating-package dependency. In addition it doesn't require coffeescript and the npm dependencies are updated.

# Cloudinary Image/File Uploader
Cloudinary provides a simple way for uploading files to Cloudinary, which in turn can be set up to sync with your Amazon S3 service. This is useful for uploading and actively manipulating images and files that you want accesible to the public. Cloudinary is built on [Cloudinary (NPM)](https://github.com/cloudinary/cloudinary_npm) and [Cloudinary (JS)](https://github.com/cloudinary/cloudinary_js). Installing this package will make `Cloudinary` available server-side and `$.cloudinary` available client-side.

## Installation

``` sh
$ meteor add lmachens:cloudinary
```

## How to upload
### Step 1
Configure your Cloudinary Credentials and Delete Authorization Rules. SERVER SIDE AND CLIENT SIDE.

``` js
// SERVER
Cloudinary.config({
	cloud_name: 'cloud_name',
	api_key: '1237419',
	api_secret: 'asdf24adsfjk'
});

// Rules are all optional
Cloudinary.rules.delete = () => {
	if (this.userId === "my_user_id") {
		// The rule must return true to pass validation, if you do not set a rule, the validation will always pass
	}
	this.public_id; // The public_id that is being deleted
};

Cloudinary.rules.signature = () => { // This one checks whether the user is allowed to upload or not
	if (this.userId === "my_user_id") {
		// The rule must return true to pass validation, if you do not set a rule, the validation will always pass
	}
};

Cloudinary.rules.private_resource = () => {
	if (this.userId === "my_user_id") {
		// The rule must return true to pass validation, if you do not set a rule, the validation will always pass
	}
};

Cloudinary.rules.download_url = () => {
	if (this.userId === "my_user_id") {
		// The rule must return true to pass validation, if you do not set a rule, the validation will always pass
	}
};

// CLIENT
$.cloudinary.config({
	cloud_name: "cloud_name"
});

```

### Step 2
Wire up your `input[type="file"]`. CLIENT SIDE.

``` js
Cloudinary.upload(event.currentTarget.files, {
	folder: "secret", // optional parameters described in http://cloudinary.com/documentation/upload_images#remote_upload
	type: "private", // optional: makes the image accessible only via a signed url. The signed url is available publicly for 1 hour.
	(err, res) => { // optional callback, you can catch with the Cloudinary collection as well
		console.log(`Upload Error: ${err}`);
		console.log(`Upload Result: ${res}`);
	}
});

```

## How to protect your images
You will need an **Advanced Cloudinary** account before you can make your images fully private. Once you have your account you can do one of 2 things:

- Set up a custom CNAME and ask Cloudinary to whitelist your domains via email
- Upload `type:"authenticated"` images and request them via cloudinary's authentication scheme (I'm working on simplifying this part)

## Compatibility
You can use the collection-hooks package to hook up to the offline collection `Cloudinary.collection`.

If you are using the `browser-policy` package, don't forget to allow images from cloudinary to load on your webapp by using `BrowserPolicy.content.allowImageOrigin("res.cloudinary.com")`

Here are all the transformations you can apply:
[http://cloudinary.com/documentation/image_transformations#reference](http://cloudinary.com/documentation/image_transformations#reference)

### Cordova Android Bug with Meteor 1.2+

Due to a [bug in the Cordova Android version that is used with Meteor 1.2](https://issues.apache.org/jira/browse/CB-8608?jql=project%20%3D%20CB%20AND%20text%20~%20%22FileReader%22), you will need to add the following to your mobile-config.js or you will have problems with this package on Android devices:

```js
App.accessRule("blob:*");
```


## How to delete from Cloudinary
Just pass the public_id of the image or file through this function (security features pending). It will return an object with a list of the images deleted as a result.

``` js
Cloudinary.delete(response.public_id, (err,res) => {
	console.log(`Upload Error: ${err}`);
	console.log(`Upload Result: ${res}`);
});
```

## How to generate a downloadable link
``` js
Meteor.call("c.get_download_url", public_id, (err,d ownload_url) => {
	console.log(`Upload Error: ${err}`);
	console.log(download_url);
});
```

### API
- Cloudinary.config(options) **(SERVER)** __required__:
	- cloud_name: Name of your cloud
	- api_key: Your Cloudinary API Key
	- api_secret: Your Cloudinary API Secret

- Cloudinary.rules **(SERVER)** __optional__: This is a javascript object of rules as functions
	- Cloudinary.rules.delete: Checks whether deleting a resource is allowed. Return true to allow the action.
	- Cloudinary.rules.signature: Checks whether uploading a resource is allowed. Return true to allow the action.
	- Cloudinary.rules.private_resource: Checks whether getting a private resource is allowed. Return true to allow the action.
	- Cloudinary.rules.download_url: Checks whether fetching a download link for a resource is allowed. Return true to allow the action.

### Helpers

- Cloudinary.url(public_id, options): Generates a url
	- public_id: The public ID returned after uploading a resource
	- options: A set of transformations described here [http://cloudinary.com/documentation/image_transformations#reference](http://cloudinary.com/documentation/image_transformations#reference)

- Cloudinary.private_url(public_id, options): Generates a signed url
	- public_id: The public ID returned after uploading a resource
	- options: A set of transformations described here [http://cloudinary.com/documentation/image_transformations#reference](http://cloudinary.com/documentation/image_transformations#reference)

- Cloudinary.expiring_url(public_id): Generates a url that will expire in 1 hour, does not take any transformations
	- public_id: The public ID returned after uploading a resource


## Notes
A security filter is missing, I know how I want it to work I just haven't had the time to build it. Enjoy the new version!
