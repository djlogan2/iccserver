export const standard_guest_roles = ["login"];

export const standard_member_roles = [
  "login",
  "send_messages",
  "play_rated_games"
];

export const fields_viewable_by_account_owner = {
  username: 1,
  createdAt: 1,
  rating: 1,
  emails: 1,
  "profile.firstname": 1,
  "profile.lastname": 1,
  "profile.legacy.username": 1,
  "profile.legacy.autologin": 1
};

export const viewable_logged_on_user_fields = {
  username: 1,
  rating: 1
};
