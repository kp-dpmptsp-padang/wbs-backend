"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      violation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      actors: {
        type: Sequelize.STRING,
        allowNull: false
      },
      detail: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      unique_code: {
        type: Sequelize.STRING,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('menunggu-verifikasi', 'diproses', 'ditolak', 'selesai'),
        allowNull: false
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      admin_notes: {
        type: Sequelize.TEXT
      },
      admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reports");
  },
};
