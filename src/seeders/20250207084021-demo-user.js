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
          password: await hashPassword("superadminpassword"),
          role: "super-admin",
          name: "Super Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "adminverifikator@example.com",
          password: await hashPassword("adminverifikatorpassword"),
          role: "admin-verifikator",
          name: "Admin Verifikator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "adminprosesor@example.com",
          password: await hashPassword("adminprosesorpassword"),
          role: "admin-prosesor",
          name: "Admin Prosesor",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "pelapor@example.com",
          password: await hashPassword("pelaporpassword"),
          role: "pelapor",
          name: "Pelapor",
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
