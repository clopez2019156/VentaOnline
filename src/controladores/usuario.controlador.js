'use strict'

var Categoria = require("../modelos/categoria.model");
var Factura = require("../modelos/factura.model");
var Producto = require("../modelos/producto.model");
var Usuario = require("../modelos/usuario.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function administrador(req, res) {
    var usuario = Usuario();
    usuario.nombre = "Administrador";
    usuario.username = "Administrador";
    usuario.rol = "ROL_ADMIN";
    Usuario.find({
        nombre: "Administrador"
    }).exec((err, adminNoEncontrado) => {
        if (err) return console.log({ mensaje: "Error al crear Administrador" });
        if (adminNoEncontrado.length >= 1) {
            return console.log("El Administrador está listo");
        } else {
            bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
                usuario.password = passwordEncriptada;
                usuario.save((err, usuarioguardado) => {
                    if (err) return console.log({ mensaje: "Error en la peticion" });
                    if (usuarioguardado) {
                        console.log("Administrador preparado");
                    } else {
                        console.log({ mensaje: "El administrador no está listo" });
                    }
                });
            });
        }
    });
}

function agregarUsuario(req, res) {
    var usuario = new Usuario();
    var params = req.body;
    if (params.nombre && params.password) {
        usuario.nombre = params.nombre;
        usuario.username = params.username;
        usuario.rol = 'ROL_CLIENTE';
        Usuario.find({ username: usuario.username }).exec((err, usuariosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuario' });
            if (usuariosEncontrados && usuariosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'usuario ya existente' });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuario.password = passwordEncriptada;

                    usuario.save((err, usuarioGuardado) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Usuario' });

                        if (usuarioGuardado) {
                            res.status(200).send({ usuarioGuardado });
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar el Usuario' })
                        }
                    });
                });
            }
        });
    }
}

function login(req, res) {
    var params = req.body;
    Usuario.findOne({ username: params.username }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (usuarioEncontrado) {
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la petición" });
                if (passVerificada) {
                    if (params.getToken == "true") {
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        });
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: "El Usuario no se ha podido identificar" });
                }
            });
        } else {
            return res.status(500).send({ mensaje: "Error al buscar el Usuario" });
        }
    });
}

function editarUsuario(req, res) {
    var idUsuario = req.user.sub;
    var params = req.body;
    delete params.password;
    // Cambiar el token si edita el ROL, si no va a ser que nunca edito el rol

    Usuario.find({ username: params.username }).exec((err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
        if (usuarioEncontrado && usuarioEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre de usuario ya existe' });
        }

        if (req.user.rol != "ROL_ADMIN") {
            Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se pudo editar al Usuario' });
                return res.status(200).send({ usuarioActualizado })
            });
        } else {
            return res.status(500).send({ mensaje: 'No se puede editar el Administrador' });
        }

    });

}

function eliminarUsuario(req, res) {
    var idUsuario = req.user.sub;

    if (req.user.rol === "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "No se puede eliminar un Administrador" });
    }

    Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se pudo Eliminar el usuario" });
        return res.status(200).send({ mensaje: "Se ha eliminado el Usuario" });
    });


}

module.exports = {
    administrador,
    agregarUsuario,
    login,
    editarUsuario,
    eliminarUsuario
}