import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:loopo/services/location_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('LocationService defaults and popular cities', () {
    final service = LocationService();
    expect(service.currentCity, isNotEmpty);
    expect(LocationService.popularCities, isNotEmpty);
    expect(LocationService.popularCities.first['city'], equals('Bangalore'));
  });

  test('LocationService setLocation updates state and notifies', () {
    final service = LocationService();
    bool notified = false;
    service.addListener(() {
      notified = true;
    });

    service.setLocation(
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      lat: 19.0760,
      lng: 72.8777,
      isGps: false,
    );

    expect(service.currentCity, equals('Mumbai'));
    expect(service.currentState, equals('Maharashtra'));
    expect(service.latitude, equals(19.0760));
    expect(service.longitude, equals(72.8777));
    expect(service.hasSavedLocation, isTrue);
    expect(notified, isTrue);
  });

  test('LocationService persists and restores from SharedPreferences', () async {
    SharedPreferences.setMockInitialValues({
      'loopo_location': '{"city":"Delhi NCR","state":"Delhi","country":"India","latitude":28.7041,"longitude":77.1025,"isGps":true}',
    });

    final service = LocationService();
    await service.loadSavedLocation();

    expect(service.currentCity, equals('Delhi NCR'));
    expect(service.currentState, equals('Delhi'));
    expect(service.latitude, equals(28.7041));
    expect(service.longitude, equals(77.1025));
    expect(service.isRealGps, isTrue);
    expect(service.hasSavedLocation, isTrue);
  });
}
