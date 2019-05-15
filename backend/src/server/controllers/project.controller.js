import Project from '../models/project.model';
import User from '../models/user.model';

function load(req, res, next, id) {
    if (id === 'undefined') {
        return res.status(400).json({ message: 'Project id is undefined.' });
    }

    Project.get(id)
        .then((project) => {
            req.project = project;
            next();
        })
        .catch(e => next(e));
}

function get(req, res) {
    return res.json(req.project);
}

async function create(req, res, next) {
    const project = new Project({
        approvers: req.body.approvers,
        roles: req.body.roles,
        name: req.body.name,
        description: req.body.description,
        active: req.body.active,
    });

    project.save()
        .then(savedProject => res.json(savedProject))
        .catch(e => next(e));
}

function update(req, res, next) {
    const project = req.project;
    project.approvers = req.body.approvers;
    project.name = req.body.name;
    project.roles = req.body.roles;
    project.description = req.body.description;
    project.active = req.body.active;

    project.save()
        .then(savedProject => res.json(savedProject))
        .catch(e => next(e));
}

function list(req, res, next) {
    const { limit, skip } = req.query;
    Project.list({ limit, skip })
        .then(projects => res.json(projects))
        .catch(e => next(e));
}

async function remove(req, res, next) {
    const project = req.project;
    const { _id: projectId } = project;

    const assignedUsers = await User.find({ 'projectRoles.project': projectId });

    if (assignedUsers && assignedUsers.length > 0) {
        return res.status(403).json({ message: `Project is assigned to ${assignedUsers.length} users` });
    } else {
        project.remove()
            .then(deletedProject => res.json(deletedProject))
            .catch(e => next(e));
    }
}

function getUsers(req, res, next) {
    const { projectId } = req.params;
    if (projectId === 'undefined') {
        return res.status(400).json({ message: 'Project id is undefined.' });
    }

    User.find({ 'projectRoles.project': projectId })
        .then(users => res.json(users))
        .catch(e => next(e));
}

export default { load, get, create, update, list, remove, getUsers };
