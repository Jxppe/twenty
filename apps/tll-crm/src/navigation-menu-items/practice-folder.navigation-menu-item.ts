import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Work',
  icon: 'IconBriefcase',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
