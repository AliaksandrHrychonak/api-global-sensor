module.exports = class UserDto {
  email;
  name;
  surname;
  avatar;
  roles;
  id;
  acceptTerms;
  isActivated;

  constructor(model) {
    this.email = model.email;
    this.name = model.name;
    this.surname = model.surname;
    this.avatar = model.avatar;
    this.roles = model.roles;
    this.id = model._id;
    this.acceptTerms = model.acceptTerms;
    this.isActivated = model.isActivated;
  }
}