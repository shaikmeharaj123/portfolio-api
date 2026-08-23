const Project = require("../models/Project.js");
const factory = require("./factory.controller.js");

exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
exports.getProject = factory.getOne(Project);
exports.getAllProjects = factory.getAll(Project);
