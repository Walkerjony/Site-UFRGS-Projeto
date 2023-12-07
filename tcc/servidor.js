var http = require('http');
var fs = require('fs');
const express = require('express');
const session = require('express-session');
const app = express();
var formidable = require('formidable');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const mv = require('mv')
const crypto = require('crypto')
const port = 3144;
const saltRounds = 10
const path = require('path')
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({secret: 'secret', resave: true, saveUninitialized: true})); //Session setup
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tcc"
});

/*
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tcc"
});
*/

con.connect(function(err) {
    if(err) throw err;
    console.log("Conectado");
});


// ROTAS --------------------------------------------------------------------------------------------------------------

app.get('/', function(req, res){
    res.render('cadastroLogin');
});

app.get('/cadastrarLivro', function(req, res){
    if(req.session.iduser == 1){
        res.render('cadastrarLivro');
    }else{
        res.send("Você não tem permissão para acessar esta função.");
    }
});

app.get('/cadastrarLivroPuc', function(req, res){
    if(req.session.iduser == 1){
        res.render('cadastrarLivroPuc');
    }else{
        res.send("Você não tem permissão para acessar esta função.");
    }
});

app.get('/adm', function(req, res){
    res.render('cadastroLoginAdm');
});

app.get('/cadastro-login', function(req, res){
    res.render('index');
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
    })
    res.render('cadastroLogin');
});

app.get('/index', function(req, res){
    var sql = "SELECT * FROM tb_livro";
    var user = req.session.username
    var isAdm = req.session.idadm
    var foto =  req.session.foto
    con.query(sql, function (err, result){
            if (err) throw err;
            res.render('index', {dadosLivro: result, user: user, isAdm: isAdm, foto: foto});
    });
});

app.get('/comentario/:id', function(req, res) {
    if (req.session.loggedin) {
        var id_livro = req.params.id;
        var user = req.session.username;
        var foto = req.session.foto;

        var sql = "SELECT * FROM tb_livro WHERE id_livro = ?";
        var sql2 = "SELECT * FROM tb_comentario WHERE fk_id_livro = ?";
        var sql3 = "SELECT tb_usuario.nome, tb_comentario.comentario FROM tb_usuario INNER JOIN tb_comentario ON tb_usuario.id_usuario = tb_comentario.fk_id_usuario WHERE tb_comentario.fk_id_livro = ?";
        con.query(sql, [id_livro], function (err, result) {
            if (err) throw err;
            con.query(sql2, [id_livro], function (err, result2) {
                if (err) throw err;
                con.query(sql3, [id_livro], function (err, result3) {
                    if (err) throw err;
                    res.render('comentario', { dadosLivro: result, user: user, foto: foto, dadosComentario: result2, dadosUser: result3 });
                    console.log(result2);
                });
            });
        });
    } else {
        res.render('cadastroLogin');
    }
});




app.post('/comentario/:id', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
            var id = req.session.iduser;
            var id_livro = req.params.id;
            var sql = "INSERT INTO tb_comentario (comentario, fk_id_usuario, fk_id_livro) VALUES ?";
            var values = [
                [fields['comentario'], id, id_livro]
            ];
            con.query(sql, [values], function(err, result){
                if(err) throw err;
                console.log("Registros inseridos: " + result.affectedRows);
                res.redirect('back');
            });
        });
    });

app.get('/anotacao', function(req, res){
        var id = req.session.iduser;
        var user = req.session.username
        var foto =  req.session.foto
        
        var sql = "SELECT * FROM tb_anotacao WHERE fk_id_usuario = ?";
        con.query(sql, id, function (err, result){
            if (err) throw err; 
            res.render('anotacao', {dadosAnotacao: result, user: user, foto: foto,});
            console.log(result)
        });
    });


app.post('/cadastro', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        var senha = fields['senha'];
        var oldpath = files.foto.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeimg = hash +'.'+files.foto.mimetype.split('/')[1];       
        var newpath = path.join(__dirname, 'public/imagens/', nomeimg);
        mv(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        bcrypt.hash(senha, saltRounds, function(err, hash){
            var sql = "INSERT INTO tb_usuario (nome, email, senha, descricao, foto) VALUES ?";
            var values = [
                [fields['nome'], fields['email'], hash,  fields['descricao'], nomeimg]
            ];
            con.query(sql, [values], function(err, result){
                if(err) throw err;
                console.log("Registros inseridos: " + result.affectedRows);
                res.redirect('/');
            });
        });
    });
});


app.post('/cadastrarLivro', function(req, res) {
    if(req.session.iduser == 1) {
        var form = new formidable.IncomingForm();
         form.parse(req, (err, fields, files) => {    
        var oldpath = files.foto_livro.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeimg = hash +'.'+files.foto_livro.mimetype.split('/')[1];       
        var newpath = path.join(__dirname, 'public/capasLivros/', nomeimg);
        mv(oldpath, newpath, function (err) {
            if (err) throw err;
        });         

       

        var sql = "INSERT INTO tb_livro (titulo, autor, descricao, pdf_livro, link_compra, foto_livro, fk_id_universidade) VALUES ?";
        var values = [
            [fields['titulo'], fields['autor'], fields['descricao'],  fields['pdf_livro'],  fields['link_compra'], nomeimg, 1]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Registros inseridos: " + result.affectedRows);
            res.redirect('/index');
        });     
    });
  }else{
    res.render('index')
}
});


app.post('/cadastrarLivroPuc', function(req, res) {
    if(req.session.iduser == 1) {
        var form = new formidable.IncomingForm();
        console.log("About to parse...");
        form.parse(req, (err, fields, files) => {    
    
            var oldpath = files.foto_livro.filepath;
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            var nomeimg = hash +'.'+files.foto_livro.mimetype.split('/')[1];       
            var newpath = path.join(__dirname, 'public/capasLivros/', nomeimg);
            mv(oldpath, newpath, function (err) {
                if (err) throw err;
            });         
    
        
    
            var sql = "INSERT INTO tb_livro (titulo, autor, descricao, pdf_livro, link_compra, foto_livro, fk_id_universidade) VALUES ?";
            var values = [
                [fields['titulo'], fields['autor'], fields['descricao'],  fields['pdf_livro'],  fields['link_compra'], nomeimg, 2]
            ];
            con.query(sql, [values], function (err, result) {
                if (err) throw err;
                console.log("Registros inseridos: " + result.affectedRows);
                res.redirect('/index');
            });     
        });
    }else{
        res.render('index')
    }
   
});

app.post('/cadastroAdm', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        var senha = fields['senha'];
        var oldpath = files.foto.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeimg = hash +'.'+files.foto.mimetype.split('/')[1];       
        var newpath = path.join(__dirname, 'public/imagensAdm/', nomeimg);
        mv(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        bcrypt.hash(senha, saltRounds, function(err, hash){
            var sql = "INSERT INTO tb_adm (nome, email, senha, descricao, foto) VALUES ?";
            var values = [
                [fields['nome'], fields['email'], hash,  fields['descricao'], nomeimg]
            ];
            con.query(sql, [values], function(err, result){
                if(err) throw err;
                console.log("Registros inseridos: " + result.affectedRows);
                res.redirect('/');
            });
        });
    });
});

app.post('/login', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var senha = fields.senha;
        var email = fields.email
        var sql = "SELECT * FROM tb_usuario where email = '" + email + "'";
        con.query(sql, function(err, result){
            if(err) throw err;
            if(result.length){
                bcrypt.compare(senha, result[0]['senha'], function(err, resultado) {
                    if(err) throw err;
                    if(resultado){
                        req.session.loggedin = true;
                        req.session.iduser = result[0]['id_usuario'];
                        req.session.username = result[0]['nome'];
                        req.session.email = result[0]['email'];
                        req.session.bio = result[0]['descricao'];
                        req.session.foto = result[0]['foto'];
                        res.redirect('/index');
                        console.log("user", req.session.loggedin)
                        console.log("nome", req.session.username)
                        res.end();
                    } else {
                        res.render('cadastroLogin', {mensagem: "Senha incorreta!"});
                    }
                });
            } else {
                res.render('cadastroLogin', {mensagem: "Email inválido!"});
            }
        });
    });
});

app.post('/loginAdm', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var senha = fields.senha;
        var email = fields.email
        var sql = "SELECT * FROM tb_adm where email = '" + email + "'";
        con.query(sql, function(err, result){
            if(err) throw err;
            if(result.length){
                bcrypt.compare(senha, result[0]['senha'], function(err, resultado) {
                    if(err) throw err;
                    if(resultado){
                        req.session.admLogado = true;
                        req.session.idadm = result[0]['id_adm'];
                        req.session.username = result[0]['nome'];
                        req.session.email = result[0]['email'];
                        req.session.bio = result[0]['descricao'];
                        req.session.foto = result[0]['foto'];
                        res.redirect('/index');
                        console.log("adm,", req.session.admLogado)
                        res.end();
                    } else {
                        res.render('cadastroLogin', {mensagem: "Senha incorreta!"});
                    }
                });
            } else {
                res.render('cadastroLogin', {mensagem: "Email inválido!"});
            }
        });
    });
});


app.post('/criarAnotacao/:id', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        var id = req.session.iduser;
        console.log(id)
        var sql = "INSERT INTO tb_anotacao (titulo, fk_id_usuario) VALUES ?";
        var values = [
            [fields['titulo'], id]
        ];
        con.query(sql, [values], function(err, result) {
            if (err) throw err;
            console.log("Registros inseridos: " + result.affectedRows);
            var id = req.session.iduser;
            var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao = "+id+""; 
            con.query (sqlc, function (err, result2) {
                if (err) throw err;
                res.redirect('/anotacao');
            });
        });
    }); 
});


app.get('/deletarAnotacao/:id', function(req, res) {
    if(req.session.loggedin) {
        var id = req.params.id;
        var sql = "SELECT * FROM tb_anotacao WHERE id_anotacao = "+id+"";
        con.query(sql, function(err, result) {
            if (err) throw err;
            var anotacoes = result[0]["id_anotacao"];
            var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao = "+anotacoes+""; 
            con.query (sqlc, function (err, result3) {
                if (err) throw err;
                var sql = "DELETE FROM tb_anotacao WHERE id_anotacao = " +id;
                con.query(sql, function(err){
                    if (err) throw err;
                    var sqlc = "DELETE FROM tb_anotacao WHERE id_anotacao = " +id;
                    con.query(sqlc, function(err, result4) {
                        if (err) throw err;
                        console.log("Registros apagados: " + result4.affectedRows);
                    });
                });
            });    
            res.redirect('/anotacao');
        });
    } else {
        res.redirect('/cadastroLogin');
    }
});

app.get('/deletarComentario/:id', function(req, res) {
    if(req.session.loggedin) {
        var id = req.params.id;
        var userId = req.session.iduser; 

        var sql = "SELECT * FROM tb_comentario WHERE id_comentario = ?";
        con.query(sql, [id], function(err, result) {
            if (err) throw err;
            
            if (result.length > 0) {
                var comentario = result[0];
                var autorComentario = comentario.fk_id_usuario; 

                if (autorComentario === userId) {
                    var deleteSql = "DELETE FROM tb_comentario WHERE id_comentario = ?";
                    con.query(deleteSql, [id], function(err, result) {
                        if (err) throw err;
                        console.log("Comentário apagado com sucesso!");
                        res.redirect('back');
                    });
                } else {
                    res.send("Você não tem permissão para apagar este comentário.");
                }
            } else {
                res.send("Comentário não encontrado.");
            }
        });
    } else {
        res.redirect('/cadastroLogin');
    }
});


app.post('/modificaAnotacao/:id', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err ,fields) => {
        var id = req.params.id;
        var sql = "UPDATE tb_anotacao SET qnt_paginas = ?, qnt_lidas = ? where id_anotacao = ?";
        var values = [
            [fields['qnt_paginas']], [fields['qnt_lidas']], id
        ];
        con.query(sql, values, function(err){
            if(err) throw err;
            var id = req.session.iduser;
            var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao ="  + id;                    
            con.query(sqlc, function(err, result){                         
                if (err) throw err; 
                var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao = " +["id_anotacao"]; 
                con.query (sqlc, function (err, result2) {
                    if (err) throw err;
                });                                                                      
            });
        });
        res.redirect('/anotacao')
    });
});


app.post('/editaTopico/:id', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err ,fields) => {
        var id = req.params.id;
        var sql = "UPDATE tb_anotacao SET nome = ? where id_anotacao = ?";
        var values = [
            [fields['nomeTopico']], id
        ];
        con.query(sql, values, function(err){
            if(err) throw err;
            var id = req.session.iduser;
            var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao ="  + id;                    
            con.query(sqlc, function(err, result){                         
                if (err) throw err; 
                var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao = " +["id_anotacao"]; 
                con.query (sqlc, function (err, result2) {
                    if (err) throw err;
                });                                                                      
            });
        });
        res.redirect('/anotacao')
    });
});

app.post('/modificaTopico/:id', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, (err ,fields) => {
        var id = req.params.id;
        var sql = "UPDATE tb_anotacao SET nome = ? where id_anotacao = ?";
        var values = [
            [fields['nome']], id
        ];
        con.query(sql, values, function(err){
            if(err) throw err;
            var id = req.session.iduser;
            var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao ="  + id;                    
            con.query(sqlc, function(err, result){                         
                if (err) throw err; 
                var sqlc = "SELECT * FROM tb_anotacao WHERE id_anotacao = " +["id_anotacao"]; 
                con.query (sqlc, function (err, result2) {
                    if (err) throw err;
                });                                                                      
            });
        });
        res.redirect('/anotacao')
    });
});

app.post('/atualizarPerfil/:id', function(req, res){
    if (req.session.loggedin){
        var form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            var id = req.params.id;
            var sql = "SELECT * FROM tb_usuario where id_usuario  = ?";
            con.query(sql, id, function(err, result, fields){
                if(err) throw err;
                const img = path.join(__dirname, 'public/imagens/', result[0]['foto']);
                fs.unlink(img, (err) => { 
                });
            });
            var oldpath = files.foto.filepath;
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            var nomeimg = hash + '.' + files.foto.mimetype.split('/')[1]
            var newpath = path.join(__dirname, 'public/imagens/', nomeimg);
            mv(oldpath, newpath, function (err) {
                if (err) throw err;
            });
            var sql = "UPDATE tb_usuario SET nome = ?, email = ?, descricao = ?,  foto = ? where id_usuario = ?";
            var values = [
                    [fields['nome']], [fields['email']], [fields['descricao']], nomeimg, [id]
            ];
            con.query(sql, values, function(err, result){
                if(err) throw err;
                var sqlc = "SELECT * FROM tb_usuario WHERE id_usuario  = "+id+"";                    
                con.query(sqlc,  function(err, result){                         
                    if (err) throw err;                         
                    req.session.loggedin = true;                        
                    req.session.iduser = result[0]['id_usuario'];
                    req.session.username = result[0]['nome'];
                    req.session.email = result[0]['email'];
                    req.session.bio = result[0]['descricao'];
                    req.session.foto = result[0]['foto'];  
                    res.redirect('/perfil');                     
                });
            });
        });
    }else{
        res.redirect('/cadastro-login')
    }
   
});

app.get('/perfil', function(req, res) {
        var id = req.session.iduser;
        var user = req.session.username
        var foto =  req.session.foto

        var sql = "SELECT * FROM tb_usuario WHERE id_usuario = ?";
        con.query(sql, id, function (err, result){
            if (err) throw err;
            res.render('perfil', {dadosConta: result, user: user, foto: foto, dadosNome: req.session.username, dadosFoto: req.session.foto});
        });
    })


    app.get('/perfilAdm', function(req, res) {
            var id = req.session.id_adm;
            var user = req.session.username
            var foto =  req.session.foto
    
            var sql = "SELECT * FROM tb_adm WHERE id_adm = ?";
            con.query(sql, id, function (err, result){
                if (err) throw err;
                res.render('perfilAdm', {dadosConta: result, user: user, foto: foto, dadosNome: req.session.id_adm, dadosFoto: req.session.foto});
            });
        })

app.get('/atualizarPerfil/:id', function(req, res){
    if(req.session.loggedin) {
        var id = req.params.id;
        var user = req.session.username
        var foto =  req.session.foto
        var sql = "SELECT * FROM tb_usuario WHERE id_usuario = ?";
        con.query(sql, id, function(err, result){
            if (err) throw err;
            res.render('atualizarPerfil', {dadosConta: result, user: user, foto: foto,});
        });
    }
    else {
        res.render('cadastroLogin');
    }
});

app.post('/criarLivro', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {         
        var oldpath = files.imagem.filepath;
        var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var nomeimg = hash +'.'+files.imagem.mimetype.split('/')[1];       
        var newpath = path.join(__dirname, 'public/imagensLivros/', nomeimg);
        mv(oldpath, newpath, function (err) {
            if (err) throw err;
        });         
        var sql = "INSERT INTO tb_livros (titulo, qnt_paginas, qnt_lidas, ) VALUES ?";
        var values = [
            [fields['nome'], nomeimg, req.session.iduser]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Registros inseridos: " + result.affectedRows);
            res.redirect('/home');
        });     
    });
});




app.listen(port);
console.log('Executando na porta: ' + port);