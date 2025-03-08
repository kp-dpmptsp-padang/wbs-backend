"use strict";
const { hashPassword } = require("../utils/password");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "superadmin@example.com",
          password: await hashPassword("superadmin"),
          role: "super-admin",
          name: "Super Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "admin@example.com",
          password: await hashPassword("admin123"),
          role: "admin",
          name: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "pelapor@example.com",
          password: await hashPassword("pelapor123"),
          role: "user",
          name: "User",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
