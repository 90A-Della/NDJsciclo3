'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pedido extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pedido.belongsTo(models.Cliente, {foreignKey:'ClienteId', as: 'cliente'});
      Pedido.belongsToMany(models.Servico, {foreignKey:'Servico', through: 'ItemPedido', as: 'servicosped'});
      Pedido.hasMany(models.ItemPedido, {foreignkey: 'PedidoId', as: 'item_pedidos'});
    }
  }
  Pedido.init({
    dataPedido: DataTypes.DATEONLY,
    ClienteId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pedido',
  });
  return Pedido;
};