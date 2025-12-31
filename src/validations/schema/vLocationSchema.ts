import { array, minLength, nonEmpty, nullish, object, pipe, string, InferOutput } from "valibot";
import { ADDRESS_LINE_INVALID, ADDRESSES_REQUIRED, CITY_INVALID, CITY_REQUIRED, COUNTRY_INVALID, COUNTRY_REQUIRED, CREATED_BY_REQUIRED, STATE_INVALID, STREET_ADDRESS_INVALID, STREET_ADDRESS_REQUIRED, TIME_ZONE_INVALID, TIME_ZONE_REQUIRED, ZIP_INVALID, ZIP_REQUIRED } from "../../constants/appMessages";

const VLocationAddressSchema = object({
  country: pipe(
    string(COUNTRY_INVALID),
    nonEmpty(COUNTRY_REQUIRED)
  ),
  state: nullish(
    string(STATE_INVALID)
  ),
  city: pipe(
    string(CITY_INVALID),
    nonEmpty(CITY_REQUIRED)
  ),
  timeZone: pipe(
    string(TIME_ZONE_INVALID),
    nonEmpty(TIME_ZONE_REQUIRED)
  ),
  addressLine: nullish(
    string(ADDRESS_LINE_INVALID)
  ),
  streetAddress: pipe(
    string(STREET_ADDRESS_INVALID),
    nonEmpty(STREET_ADDRESS_REQUIRED)
  ),
  zip: pipe(
    string(ZIP_INVALID),
    nonEmpty(ZIP_REQUIRED)
  )
});

const VLocationSchema = object({
  addresses: pipe(
    array(VLocationAddressSchema),
    minLength(1, ADDRESSES_REQUIRED)
  )
});

// New schema for single address (for individual location creation)
const VSingleLocationSchema = VLocationAddressSchema;

const VUpdateLocationSchema = object({
  addresses: pipe(
    array(VLocationAddressSchema),
    minLength(1, ADDRESSES_REQUIRED)
  )
});

export { VLocationSchema, VUpdateLocationSchema, VLocationAddressSchema, VSingleLocationSchema };

export type ValidatedLocation = InferOutput<typeof VLocationSchema>;
export type ValidatedUpdateLocation = InferOutput<typeof VUpdateLocationSchema>;
export type ValidatedLocationAddress = InferOutput<typeof VLocationAddressSchema>;
