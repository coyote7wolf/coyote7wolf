'use strict';
function resolve(req) {
  return req.app.get('container');
}

exports.createUser = async (req, res, next) => {
  const container = resolve(req);
  const service = container.resolve('userService');
  try {
    const user = await service.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  const service = resolve(req).resolve('userService');
  try {
    const user = await service.getUser(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  const service = resolve(req).resolve('userService');
  const { offset, limit } = req.query;
  try {
    const result = await service.listUsers({
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json({ data: result.items, meta: { total: result.total } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  const service = resolve(req).resolve('userService');
  try {
    const updated = await service.updateUser(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const service = resolve(req).resolve('userService');
  try {
    await service.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
