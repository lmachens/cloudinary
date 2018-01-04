Package.describe({
	name:"lmachens:cloudinary",
	summary: "Upload files to Cloudinary",
	version:"5.0.4_3",
	git:"https://github.com/lmachens/cloudinary"
});

Npm.depends({
	cloudinary: "1.9.1", // Server side
	"cloudinary-core": "2.4.0" // Client side
});

Package.on_use(function (api){
	api.versionsFrom('METEOR@1.0');

	// Core Packages
	api.use(["meteor-base@1.0.1","coffeescript","mongo","underscore"], ["client", "server"]);
	api.use(["check","ecmascript","random","reactive-var"], ["client","server"]);

	// External Packages
	api.use(["matb33:collection-hooks@0.7.3","audit-argument-checks"], ["client", "server"],{weak:true});

	// Core Files
	api.add_files("server/configuration.coffee", "server");
	api.add_files("server/signature.coffee", "server");

	api.add_files("client/functions.coffee", "client");

	api.export && api.export("Cloudinary",["server","client"]);
});

