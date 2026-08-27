import {
  getSystemViewFieldUniversalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PERSON_VIEWS = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.views;
export const COMPANY_VIEWS = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views;

// Same derivation the engine used when it provisioned these, so declaring them
// updates the existing rows instead of colliding with them.
export const getDerivedViewFieldUniversalIdentifier = ({
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  });
