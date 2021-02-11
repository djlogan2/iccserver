import {
  RESOURCE_COMMUNITY,
  RESOURCE_EDITOR,
  RESOURCE_EXAMINE,
  RESOURCE_HOME,
  RESOURCE_PLAY,
  RESOURCE_PROFILE,
  RESOURCE_USERS
} from "../../constants/resourceConstants";

import Home from "../../ui/pages/Home";
import Play from "../../ui/pages/Play/Play";
import Editor from "../../ui/pages/Editor";
import Examine from "../../ui/pages/Examine";
import Community from "../../ui/pages/Community";
import UserProfile from "../../ui/pages/components/UserManagement/UserProfile";
import UsersList from "../../ui/pages/components/Users/UsersList";
import UserEdit from "../../ui/pages/components/Users/UserEdit";

const routesWithRoles = [
  {
    roles: [],
    component: Home,
    path: "/"
  },
  {
    roles: [],
    component: Home,
    path: RESOURCE_HOME
  },
  {
    roles: [],
    component: Play,
    path: RESOURCE_PLAY
  },
  {
    roles: [],
    component: Editor,
    path: RESOURCE_EDITOR
  },
  {
    roles: [],
    component: Examine,
    path: RESOURCE_EXAMINE
  },
  {
    roles: [],
    component: Community,
    path: RESOURCE_COMMUNITY
  },
  {
    roles: [],
    component: UserProfile,
    path: RESOURCE_PROFILE
  },
  {
    roles: ["list_users"],
    component: UsersList,
    path: RESOURCE_USERS
  },
  {
    roles: ["list_users"],
    component: UserEdit,
    path: `${RESOURCE_USERS}/:username`
  }
];

export default routesWithRoles;
