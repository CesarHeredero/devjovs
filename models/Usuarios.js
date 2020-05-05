const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    token: String,
    expira: Date
});

// método para hshear los passwords
usuariosSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

usuariosSchema.post('save', function(error, doc, next) {
    console.log(error);
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Ese correo ya está registrato');
    } else {
        next(error);
    }
});

usuariosSchema.methods = {
    comporbarPass: function(password) {
        return bcrypt.compareSync(password, this.password);
    }

}

module.exports = mongoose.model('Usuarios', usuariosSchema);