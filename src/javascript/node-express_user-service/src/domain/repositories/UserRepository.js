'use strict';
class UserRepository {
  async create(_user) {
    throw new Error('Not implemented');
  }
  async findById(_id) {
    throw new Error('Not implemented');
  }
  async findByEmail(_email) {
    throw new Error('Not implemented');
  }
  async update(_id, _data) {
    throw new Error('Not implemented');
  }
  async delete(_id) {
    throw new Error('Not implemented');
  }
  async list(_opts) {
    throw new Error('Not implemented');
  }
  async count(_opts) {
    throw new Error('Not implemented');
  }
}

module.exports = UserRepository;
