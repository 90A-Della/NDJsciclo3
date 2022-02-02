const express = require('express');
const cors = require('cors');
const {Sequelize, sequelize} = require ('./models');

const models = require('./models');
const {response} = require ('express');
const res = require('express/lib/response');

const app = express();
app.use(cors());
app.use(express.json());

let cliente = models.Cliente;
let itempedido = models.ItemPedido;
let pedido = models.Pedido;
let servico = models.Servico;

let port = process.env.PORT || 3001;
app.listen(port, (req, res)=>{
    console.log('Servidor ativo: http://localhost:3001');
});

app.get('/', function (req, res){
    res.send('Olá, mundo!');
});
// app.get('/Clientes', function (req, res){
//     res.send('Seja Bem-vindo(a) a ServicesTI.');
// });
// app.get('/Pedidos', function (req, res){
//     res.send('Pedido(s) realizado(s) com sucesso!');
// });
// app.get('/Servicos', function (req, res){
//     res.send('Faça a sua escolha!');
// });
// app.get('/ItemPedidos', function (req, res){
//     res.send('Esses são seus item pedidos.');
// });

//inserir novo serviço
app.post('/servicos', async (req, res)=>{
    await servico.create(
        req.body
    ).then(function(){
        return res.json({
            error: false,
            message: "Serviço criado com sucesso!"
        })
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: "Foi impossivel se conectar."
        });
    });
});

//inserindo novo cliente
app.post('/cliente', async(req, res)=> {
    await cliente.create (
        req.body
    ).then(cli => {
        return res.json({
            error: false,
            message: "Cliente foi inserido com sucesso!",
            cli
        });
    }).catch(erro => {
        return res.status(400).json({
            error: true,
            message: "Problema de conexão"
        });
    });
});

//Inserir novo pedido para um  cliente existente
app.post('/cliente/:id/pedido', async(req, res)=> {
    const ped = {
        dataPedido: req.body.data,
        ClienteId: req.params.id
    };
    if(! await cliente.findByPk(req.params.id)){
       return res.status(400).json({
           error: true,
           message: "Cliente não existente."
       }); 
    };
    await pedido.create(ped)
        .then(pedcli => {
            return res.json({
                error: false,
                message: "pedido inserido com sucesso.",
                pedcli
            });
        }).catch(erro => {
            return res.status(400).json({
                error : true,
                message: "Não foi possivel inserir o pedido."
            });
        });
});

//inserir lista de Itens Pedidos
app.post('/itempedido', async(req, res)=>{
    await itempedido.create(
        req.body
    ).then(function(){
        return res.json({
            error: false,
            message: "Item criado com sucesso!"
        })
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: "Foi impossivel se conectar."
        });
    });
});

//lista de serviços
app.get('/listaservicos', async(req, res)=>{
    await servico.findAll({
        //raw:true
        order: [['nome', 'ASC']]
    }).then(function(servicos){
        res.json({servicos});
    });
});

//Oferta de serviços
app.get('/ofertaservicos', async(req, res)=>{
    await servico.count('id').then(function(servicos){
        res.json({servicos});
    });
});

//exibir um serviço
app.get('/servico/:id', async(req, res)=>{
    await servico.findByPk(req.params.id)
    .then(serv => {
        return res.json({
            error: false,
            serv
        });
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: "Erro: não possivel conectar!"
        });
    });
});

//Atualizar um serviço
app.put('/atualizarservico', async(req, res)=>{
    await servico.update(req.body,{
        where:{id: req.body.id}
    }).then(function(){
        return res.json({
            error: false,
            message: "Serviço foi alterado com sucesso!"    
        });
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: "Erro na alteração do serviço."
        });
    });
});

//exibir todos os clientes
app.get('/clientes', async(req, res)=>{
    await cliente.findAll()
     .then(cli => {
         return res.json({
             error: false,
             cli
         });
     }).catch( erro => {
         return res.status(400).json({
             error: true,
             message: "Erro conexão"
         });
     });
});

//exibir todos os cliente e tudo relacionado a ele
app.get('/clientes-pedidos', async(req, res)=>{
    await cliente.findAll({include:[{all: true}]})
    .then(cli => {
        return res.json({
            error: false,
            cli
        });
    }).catch(erro => {
        return res.status(400).json({
            error: true,
            message: "Erro conexão"
        });
    });
});

//exibir  todos os pedidos de um cliente
app.get('/cliente/:id/pedidos', async(req, res)=>{
    await pedido.findAll({
        where: {ClienteId: req.params.id}
    }).then(pedidos => {
        return res.json({
            error: false,
            pedidos
        });
    }).catch(erro => {
        return res.status(400).json({
            error: true,
            message: "Não foi possivel se conectar."
        });
    });
});

//Obter um pedido
app.get('/pedidos/:id', async(req, res)=> {
    await pedido.findByPk(req.params.id, {include:[{all: true}]})
    .then(ped => {
        return res.json({ped});
    });
});

//Alteração no pedido
app.put('/pedidos/:id/editaritem', async(req, res) =>{
    const item = {
       quantidade: req.body.quantidade,
       valor: req.body.valor
    };
    if(! await pedido.findByPk(req.params.id)){
        return res.status(400).json({
            error: true,
            message: "Pedido não foi encontrado."
        });
    };
    if(! await servico.findByPk(req.body.servicoId)){
        return res.status(400).json({
            error: true,
            message: 'Serviço não foi encontrado'
        });
    };

    await itempedido.update(item, {
        where: sequelize.and({ServicoId: req.body.ServicoId}, {PedidoId: req.params.id})
    }).then(function(itens){
        return res.json({
            error: false,
            message: 'Pedido foi alterado com sucesso!',
            itens
        });
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: 'Erro: não foi possivel alteral.'
        });
    });
});

//excluir cliente 
app.get('/excluircliente/:id', async(req, res)=>{
    await cliente.destroy({
        where: {id: req.params.id}
    }).then(function(){
        return res.json({
            error: false,
            message: "Cliente excluido com sucesso!"
        });
    }).catch(function(erro){
        return res.status(400).json({
            error: true,
            message: "Erro: não foi possivel exclusão."
        });
    });
});

