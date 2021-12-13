module.exports = class UserDto {
    email;
    roles;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.roles = model.roles;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}
