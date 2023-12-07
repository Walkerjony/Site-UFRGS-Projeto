var mysql = require('mysql');
const { VARCHAR } = require('mysql/lib/protocol/constants/types');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tcc"
});

con.connect(function(err) {
    if(err) throw err;
    console.log("Conectado");

    // Tabela Usuário ----------------------------------------------------------------------------
    var sql = "CREATE TABLE tb_usuario (id_usuario INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100), email VARCHAR(255) UNIQUE, senha VARCHAR(255), descricao VARCHAR(255), foto VARCHAR(255))";

    con.query(sql, function(err, result){
        if(err) throw err;
        console.log("Tabela Usuário criada com sucesso!");
    });

    // Tabela Universidade -------------------------------------------------------------------
    var sql = "CREATE TABLE tb_universidade (id_universidade INT AUTO_INCREMENT PRIMARY KEY, sigla_universidade VARCHAR(10))";

    con.query(sql, function(err, result){
        if(err) throw err;
        console.log("Tabela Universidade criada com sucesso!");
    });
    
    // // Tabela Livro -----------------------------------------------------------------------------
    var sql = "CREATE TABLE tb_livro (id_livro INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(100), autor VARCHAR(100), descricao TEXT, pdf_livro VARCHAR(255), link_compra VARCHAR(255), foto_livro VARCHAR(255), fk_id_universidade INT, FOREIGN KEY (fk_id_universidade) REFERENCES tb_universidade(id_universidade))";
    
    con.query(sql, function(err, result){
        if(err) throw err;
        console.log("Tabela Livro criada com sucesso!");
    });

    
    // Tabela Anotação ----------------------------------------------------------------------------------
    var sql = "CREATE TABLE tb_anotacao (id_anotacao INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(100), nome VARCHAR(100), qnt_paginas INT, qnt_lidas INT, fk_id_usuario INT, FOREIGN KEY (fk_id_usuario) REFERENCES tb_usuario(id_usuario))";

    con.query(sql, function(err, result){
        if(err) throw err;
        console.log("Tabela Anotação criada com sucesso!");
    });

    // Tabela Tópico --------------------------------------------------------------------------------
    var sql = "CREATE TABLE tb_topico (id_topico INT AUTO_INCREMENT PRIMARY KEY, nome_topico VARCHAR(100), descricao TEXT, fk_id_anotacao INT, FOREIGN KEY (fk_id_anotacao) REFERENCES tb_anotacao(id_anotacao))";

    con.query(sql, function(err, result){
        if(err) throw err;
        console.log("Tabela Tópico criada com sucesso!");
    });

    // Tabela Comentário ----------------------------------------------------------------------------------------------------
    var sql = "CREATE TABLE tb_comentario (id_comentario INT AUTO_INCREMENT PRIMARY KEY, comentario TEXT, fk_id_usuario INT, FOREIGN KEY (fk_id_usuario) REFERENCES tb_usuario(id_usuario), fk_id_livro INT, FOREIGN KEY (fk_id_livro) REFERENCES tb_livro(id_livro))";

    con.query(sql, function(err, resul) {
        if(err) throw err;
        console.log("Tabela Comentário criada com sucesso!");
    });


    con.end();
});