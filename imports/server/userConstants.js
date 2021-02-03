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
  "add_dynamic_rating",
  "delete_dynamic_rating",
  "search_game_history",
  "upload_mugshot",
  "delete_mugshot",
  "delete_any_mugshot",
  "validate_mugshots",
  "upload_pgn",
  "allow_change_owner",
  "allow_private_games",
  "allow_restrict_chat",
  "allow_restrict_analysis",
  "upload_pgn",
  "kibitz",
  "create_room",
  "create_private_room",
  "room_chat",
  "join_room",
  "personal_chat",
  "create_tournament_template",
  "list_isolation_groups",
  "list_users",
  "delete_users"
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
  "kibitz",
  "upload_pgn",
  "room_chat",
  "join_room",
  "personal_chat",
  "create_private_room"
];

export const fields_viewable_by_account_owner = {
  username: 1,
  createdAt: 1,
  ratings: 1,
  emails: 1,
  locale: 1,
  board_css: 1,
  mugshot: 1,
  settings: 1,
  status: 1,
  "profile.firstname": 1,
  "profile.lastname": 1,
  "profile.legacy.username": 1,
  "profile.legacy.autologin": 1,
  cf: 1
};

export const viewable_logged_on_user_fields = {
  username: 1,
  ratings: 1,
  mugshot: 1,
  "status.game": 1,
  "status.client": 1,
  "status.legacy": 1,
  "status.lastLogin.date": 1,
  "status.idle": 1,
  cf: 1
};
