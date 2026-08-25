import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Firm setup',
  icon: 'IconSettings',
  position: 90,
  type: NavigationMenuItemType.FOLDER,
});
