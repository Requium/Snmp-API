const subtreeSchema = {
	type: "object",
	required: ["oid", "ip","apiKey"],
	properties: {
		oid: {
			type: "array",
			minLength: 1,
		},
		ip: {
			type: "array",
			minLength: 1,
		},
		community: {
			type: "string",
			minLength: 1,
		},
		apiKey: {
			type: "string",
			minLength: 1,
		},	
	},
};

module.exports = {subtreeSchema};