const errorConfig = {
  user_is_exists: 'The user with the specified email address already exists!',
  role_not_found: 'Role not found!',
  user_dto_not_generate: 'An error occurred while trying to generate an Account!',
  user_token_not_save: 'Token generation error!',
  user_activate_link_err: 'An error occurred while trying to activate the Account!',
  user_not_found_exception: 'An error occurred while trying to update the user profile!',
  user_data_err: 'Data not validated!',
  user_unauthorized: 'Authorization required!',
  unauthorized_error_credentials: 'Wrong email or password!',
  server_error: 'Something went wrong!',
  incorrect_data_id: 'Incorrect user data passed when searching by _id!',
  incorrect_data_user: 'Incorrect user data passed!',
  file_err_not_found: 'Upload file not found!',
  supported_formats: 'This file format is not supported',
  url_error: 'The link format is invalid!',
  email_error: 'The email format is not correct!',
  not_found_error: 'The resource can not be found!',
};

module.exports = errorConfig;
