const AWS = require("aws-sdk");
const recognize = new AWS.Rekognition({ region: "eu-west-1" });
const s3 = new AWS.S3({ region: "eu-west-1" });

const objects = body =>
	new Promise((resolve, reject) => {
		const Bucket = "oswald-labs-platform-temporary";
		const Key = "temp_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000000000) + 1;
		if (!body.dataUri) return reject({ error: "no_file" });
		if (!body.dataUri.includes("data:image")) return reject({ error: "invalid_file" });
		s3.putObject(
			{
				Body: new Buffer(body.dataUri.replace(/^data:image\/\w+;base64,/, ""), "base64"),
				Bucket,
				Key,
				ContentEncoding: "base64",
				ACL: "public-read"
			},
			error => {
				if (error) {
					reject(error);
				} else {
					recognize.detectLabels(
						{
							Image: {
								S3Object: {
									Bucket,
									Name: Key
								}
							}
						},
						(error, data) => {
							if (error) {
								reject(error);
							} else {
								resolve({ labels: data.Labels });
							}
							s3.deleteObject(
								{
									Bucket,
									Key
								},
								() => {}
							);
						}
					);
				}
			}
		);
	});

module.exports.api = "objects";
module.exports.promise = objects;
module.exports.responder = (req, res) => {
	objects(req.body)
		.then(r => res.json(r))
		.catch(e => res.json(e));
};
