const AWS = require("aws-sdk");
const rekognition = new AWS.Rekognition({ region: "eu-west-1" });
const s3 = new AWS.S3({ region: "eu-west-1" });

module.exports = (req, res) => {
	const Bucket = "oswald-labs-platform-temporary";
	const Key = "temp_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000000000) + 1;
	if (!req.body.dataUri.includes("data:image"))
		return res.status(400).json({ error: "invalid_file" });
	s3.putObject(
		{
			Body: new Buffer(req.body.dataUri.replace(/^data:image\/\w+;base64,/, ""), "base64"),
			Bucket,
			Key,
			ContentEncoding: "base64",
			ACL: "public-read"
		},
		error => {
			if (error) {
				res.status(error.statusCode).json({ error });
			} else {
				rekognition.detectLabels(
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
							res.status(error.statusCode).json({ error });
						} else {
							res.json({ labels: data.Labels });
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
};
