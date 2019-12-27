export const standard_guest_roles = ["login"];

export const titles = ["C", "*", "H", "FM", "IM", "GM", "WGM", "WIM", "WFM", "DM", "TD", "U"];

export const all_roles = [
  "login",
  "send_messages",
  "play_rated_games",
  "play_unrated_games",
  "legacy_login",
  "administrator",
  "developer",
  "add_dynamic_ratings",
  "create_group",
  "add_to_group",
  "remove_from_group",
  "change_group_parameter",
  "add_dynamic_rating",
  "delete_dynamic_rating",
  "search_game_history"
];

export const standard_member_roles = [
  "login",
  "send_messages",
  "play_rated_games",
  "play_unrated_games"
];

export const fields_viewable_by_account_owner = {
  username: 1,
  createdAt: 1,
  ratings: 1,
  emails: 1,
  locale: 1,
  board_css: 1,
  "profile.firstname": 1,
  "profile.lastname": 1,
  "profile.legacy.validated": 1,
  "profile.legacy.username": 1,
  "profile.legacy.autologin": 1
};

export const viewable_logged_on_user_fields = {
  username: 1,
  ratings: 1
};
