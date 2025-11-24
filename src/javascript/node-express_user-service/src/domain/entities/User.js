'use strict';
class User {
  constructor({
    id,
    name,
    email,
    createdAt = new Date(),
    updatedAt = new Date(),
    deletedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }
}

module.exports = User;
