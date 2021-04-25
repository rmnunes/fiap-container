import LocationMock from "../domain/mock/LocationMock";

class LocationService {
  constructor() {}

  async validateLocation(latLong: string): Promise<boolean> {
    let valid = LocationMock.findIndex((x) => x.latLong === latLong);

    if (valid) {
      return true;
    } else false;
  }
}

export default LocationService;
