# CoPilot Plan To Fix Tests

This plan outlines the incremental steps to refactor service classes to use dependency injection (DI) for configuration, resolving environment compatibility issues between Vite and Jest.

## Todo List

1. **Design service config interfaces** ✅ COMPLETED
   - Design a configuration interface/type for WeatherService, MoonPhaseService, and TimeService. Specify required environment variables and structure.

2. **Refactor WeatherService for DI** ✅ COMPLETED
   - Refactor WeatherService to accept config via constructor. Remove direct environment.ts dependency.

3. **Update WeatherService tests**
   - Update WeatherService tests to provide config via constructor. Remove environment mocks.

4. **Refactor MoonPhaseService & TimeService**
   - Repeat DI refactor for MoonPhaseService and TimeService. Remove environment.ts dependency from both.

5. **Update MoonPhaseService & TimeService tests**
   - Update MoonPhaseService and TimeService tests to use DI config.

6. **Update environment.ts for DI**
   - Update environment.ts to export config objects for each service, not direct values. Ensure Vite and Jest compatibility.

7. **Update service instantiation code**
   - Update any other code that instantiates services to use new DI config pattern.

---

Each step should be completed and validated before moving to the next. This approach ensures minimal disruption and maintains test coverage throughout the refactor.
