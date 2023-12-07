var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
});

/*
con.connect(function(err) {
    if(err) throw err;
    console.log("Conectado");
    var sql = "CREATE DATABASE db_mysql22 "

    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log("Banco de Dados criado com sucesso!");
    });
    con.end();
});
*/

con.connect(function(err) {
    if(err) throw err;
    console.log("Conectado");
    var sql = "CREATE DATABASE tcc"

    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log("Banco de Dados criado com sucesso!");
    });
    con.end();
});

