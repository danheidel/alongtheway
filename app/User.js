var mongoose = require('mongoose');
Schema = mongoose.Schema;
// bcrypt = require('bcrypt');
SALT=10;


var UserSchema = new Schema({
	username: {type: String},
	password: {type: String}
});


UserSchema.pre('save', function(next) {
	var user = this;
	bcrypt.genSalt(SALT, function(err, salt) {
		if(err) return next(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);
			user.password = hash;
			console.log(user.password);
			next();
		});
	});
});

module.exports = mongoose.model('User', UserSchema);