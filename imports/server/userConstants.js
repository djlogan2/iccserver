export const standard_guest_roles = ["login"];

export const titles = ["C", "*", "H", "FM", "IM", "GM", "WGM", "WIM", "WFM", "DM", "TD", "U"];

export const all_roles = [
  "login",
  "send_messages",
  "play_rated_games",
  "play_unrated_games",
  "legacy_login",
  "show_users",
  "administrator",
  "developer",
  "add_dynamic_ratings",
  "add_to_group",
  "change_limit_to_group", // TODO: Set roles to "change_user_" + field. Then decide what to do about object nesting, like if "change_user_profile" exists, that means a user can change "user.profile.legacy.username" without requiring "change_user_profile_legacy_username" ?
  "add_dynamic_rating",
  "delete_dynamic_rating",
  "search_game_history",
  "upload_mugshot",
  "delete_mugshot",
  "delete_any_mugshot",
  "validate_mugshots"
];

export const standard_member_roles = [
  "login",
  "send_messages",
  "play_rated_games",
  "play_unrated_games",
  "show_users",
  "upload_mugshot",
  "delete_mugshot",
  "validate_mugshots",
  "kibitz" //todo: hopefully what is wanted
];

export const fields_viewable_by_account_owner = {
  username: 1,
  createdAt: 1,
  ratings: 1,
  emails: 1,
  locale: 1,
  board_css: 1,
  limit_to_group: 1,
  groups: 1,
  mugshot: 1,
  "status.game": 1,
  "profile.firstname": 1,
  "profile.lastname": 1,
  "profile.legacy.validated": 1,
  "profile.legacy.username": 1,
  "profile.legacy.autologin": 1
};

export const viewable_logged_on_user_fields = {
  username: 1,
  ratings: 1,
  mugshot: 1,
  "status.game": 1
};
