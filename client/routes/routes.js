import {
  RESOURCE_COMMUNITY,
  RESOURCE_CUSTOMIZABLE_BOARD,
  RESOURCE_DEVELOPER,
  RESOURCE_DEVELOPER2,
  RESOURCE_DEVELOPER3,
  RESOURCE_DEVELOPER4,
  RESOURCE_EDITOR,
  RESOURCE_EXAMINE,
  RESOURCE_HOME,
  RESOURCE_LOGIN,
  RESOURCE_PLAY,
  RESOURCE_PROFILE,
  RESOURCE_SIGN_UP,
  RESOURCE_USERS,
} from "../constants/resourceConstants";

import Home from "../ui/pages/Home/Home";
import Play from "../ui/pages/Play/Play";
import Editor from "../ui/pages/Editor/Editor";
import Examine from "../ui/pages/Examine/Examine";
import Community from "../ui/pages/Community/Community";
import UserProfile from "../ui/pages/components/UserManagement/UserProfile";
import UsersList from "../ui/pages/components/Users/UsersList";
import UserEdit from "../ui/pages/components/Users/UserEdit";
import CustomizableBoard from "../ui/pages/CustomizableBoard";
import SignupPage from "../ui/pages/authentication/SignupPage/SignupPage";
import LoginPage from "../ui/pages/authentication/LoginPage/LoginPage";
import DeveloperContainer from "../ui/containers/DeveloperContainer";
import DeveloperContainer2 from "../ui/containers/DeveloperContainer2";
import DeveloperContainer3 from "../ui/containers/DeveloperContainer3";
import DeveloperContainer4 from "../ui/containers/DeveloperContainer4";

const authRoutes = [
  {
    roles: [],
    component: Home,
    path: "/",
    exact: true,
  },
  {
    roles: [],
    component: Home,
    path: RESOURCE_HOME,
    exact: true,
  },
  {
    roles: ["play_rated_games", "play_unrated_games"],
    component: Play,
    path: RESOURCE_PLAY,
    exact: true,
  },
  {
    roles: [],
    component: Editor,
    path: RESOURCE_EDITOR,
    exact: true,
  },
  {
    roles: [],
    component: Examine,
    path: RESOURCE_EXAMINE,
    exact: true,
  },
  {
    roles: [],
    component: Community,
    path: RESOURCE_COMMUNITY,
    exact: true,
  },
  {
    roles: [],
    component: UserProfile,
    path: RESOURCE_PROFILE,
    exact: true,
  },
  {
    roles: ["list_users"],
    component: UsersList,
    path: RESOURCE_USERS,
    exact: true,
  },
  {
    roles: ["list_users"],
    component: UserEdit,
    path: `${RESOURCE_USERS}/:username`,
    exact: true,
  },
  {
    roles: [],
    component: CustomizableBoard,
    path: RESOURCE_CUSTOMIZABLE_BOARD,
    exact: true,
  },
];

const nonAuthRoutes = [
  {
    component: SignupPage,
    path: RESOURCE_SIGN_UP,
  },
  {
    component: LoginPage,
    path: RESOURCE_LOGIN,
  },
  {
    component: DeveloperContainer,
    path: RESOURCE_DEVELOPER,
    exact: true,
  },
  {
    component: DeveloperContainer2,
    path: RESOURCE_DEVELOPER2,
    exact: true,
  },
  {
    component: DeveloperContainer3,
    path: RESOURCE_DEVELOPER3,
    exact: true,
  },
  {
    component: DeveloperContainer4,
    path: RESOURCE_DEVELOPER4,
    exact: true,
  },
];

export { authRoutes, nonAuthRoutes };
