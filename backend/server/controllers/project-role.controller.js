import Project from '../models/project.model';
import ProjectRole from '../models/project-role.model';
import User from '../models/user.model';
import APIError from '../helpers/APIError';

function load(req, res, next, id) {
    ProjectRole.get(id)
        .then((projectRole) => {
            req.projectRole = projectRole;
            next();
            return null;
        })
        .catch(e => next(e));
}

function get(req, res) {
    return res.json(req.projectRole);
}

async function create(req, res, next) {
    const projectRole = new ProjectRole({
        name: req.body.name,
        description: req.body.description,
    });

    projectRole.save()
        .then(savedProjectRole => res.json(savedProjectRole))
        .catch(e => next(e));
}

function update(req, res, next) {
    const projectRole = req.projectRole;
    projectRole.name = req.body.name;
    projectRole.description = req.body.description;


    projectRole.save()
        .then(savedProjectRole => res.json(savedProjectRole))
        .catch(e => next(e));
}

function list(req, res, next) {
    const { limit = 50, skip = 0, name } = req.query;
    const query = { limit, skip, extra: {} };

    if (name && name !== '') {
        query.extra = { name: { $regex: name, $options: 'i' } };
    }

    ProjectRole.list(query)
        .then(projectRoles => res.json(projectRoles))
        .catch(e => next(e));
}

async function remove(req, res, next) {
    const projectRole = req.projectRole;
    const { _id: projectRoleId } = projectRole;

    const assignedProjects = await Project.find({ roles: { $in: [projectRoleId] } });

    if (assignedProjects && assignedProjects.length) {
        next(new APIError(`ProjectRole is assigned to ${assignedProjects.length} projects`, 403, true));
    } else {
        projectRole.remove()
            .then(deletedProjectRole => res.json(deletedProjectRole))
            .catch(e => next(e));
    }
}

export default { load, get, create, update, list, remove };
