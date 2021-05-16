# Changelog

## [0.9.25]

### Added

- Complete step: Sign in or Sign up customer account

### Fixed

- Promotion Code with API Key

## [0.9.24]

### Fixed

- Payment method selector when multiple payment methods both in complete and my reservation

### Added

- Customer login component 

## [0.9.23]

### Added

- Mediator to allow plugin extension.

## [0.9.22]

### Fixed

- Fixed modify reservation startFromShoppingCart

## [0.9.21]

### Updated

- Refactor selector component to allow instances creation

### Updated

- My reservation pending amount refactor

## [0.9.20]

### Added

- Recaptcha integration in contact form

### Updated

- bundle do not include moment and moment-timezone

## [0.9.19]

### Fixed

- Calendar 
  - Google Translate days
  - Date range between not available dates


## [0.9.18]

### Fixed

- Reservation selector
  - Return date disabled on select return place
- Calendar with Google Translate

## [0.9.17]

### Fixed

- Resource calendar
  - Avoid select a date when it is not selectable (closed)
  - Get product detailed information to check max/min duration

- Check if fn.modal is available before opening a modal

### Added

- Translations for max and minimum renting duration

## [0.9.16]

### Added

- Selector take into account delivery/collection dates/times
- Wizard selector sales channel code

## [0.9.15]

### Added

- Renting : Complete step allow to use a template to render the form so it can be customizable.

## [0.9.14]

### Fixed

- Renting : Family API parameters

## [0.9.13]

### Added

- Renting

  - Selector Form:
    - Family selector

  - Choose Product:
    - Allow to select only one product

## [0.9.12]

### Added

- Renting

  - Country selector : 
    - Use select2 or browser select
    - Load countries
  - Added translations for common "field required" to be used in validations. 

- Renting Product Calendar

  - Include sales_channel_code to allow multiple web sites to connect with one instance

### Fixed

- Renting Calendar

  - When single_date use the range as the current month + 1

## [0.9.11]

### Fixed

- Activities: Buy tickets 

## [0.9.10]

### Added

- Renting
  - Complete
    - Apply promotion code

- Activities
  - Full activity buy (no tickets)

### Fixed

- Renting
  - Complete
    - Update payment amount when selecting extras

## [0.9.9]

### Updated

- Renting:
  - Choose products multiple units literals
  - My reservation.
    - Country selector
- Activities/Appointments
  - Customer address in order form
  - Payment deposit/pending translation

## [0.9.8]

### Added

- Renting:
  - My reservation fill data fields form. Based on business type. 

- Activities:
  - My reservation fill data filelds form. Based on business type.

### Fixed

- YSDDateControl refactor using moment

## [0.9.7]

### Added

- Activity/Appointments:
  - Search component :
    - Filter by classifiers (destination_id and category_id)

- Renting: 
  - Affiliates integration.
    - Selector/Selector wizard: Extract agentId from query string to identify affiliates
  - defaultTimeStart and defaultTimeEnd 

## [0.9.6]

### Fixed

- Renting
  - Product selector (product.js) only run code if found #product_selector element
- Activities/Appointments
  - Activity selector (Activity.js) only run code if found #buy_selector element

### Added

- Settings:
  - New attribute: Multiple items in activity/appointment reservations
- Activities/Appointments:
  - Cancel reservation
- Bootstrap modal integration
  - Improve bootstrap modal integration with backdrop compatibility

## [0.9.5]

### Added

- Renting module:
  - Wizard steps title translations
  - Wizard collection point
- Activities
  - Implemented appointments characteristics on Activity/Tickets module
    with use_rates and allow_select_places_for_reservation
	- Translations to the activities/appointment module.

## [0.9.4]

### Fixed

- Hold compatibility with old version of mybooking Wordpress themes

## [0.9.3]

### Fixed

- Compatibility with libraries that overrides Boostrap modal namespace $.modal 
- Selector wizard pickup/return place on multi-language site : value & description

## [0.9.2]

### Fixed

- Complete step payment gateway connection when only payment (no reservation request)
  
### Added

- New settings

	- Selector
		- promotionCode: Promotion code in selector
		- samePickupReturnTime: Force same pickup/return place
		- selectFamily: Select family in selector
		- selectDestination: Select destination in selector

  - Product Calendar
	  - datesSelector: Dates selector (single date or date range)
	  - singleDateTimeSelector: Date time selector
	  - singleDateSlotDurationUnits: Time slot units (minutes or hours)
	  - singleDateSlotDurationTime: Time slot duration
	  - calendarShowDailyPrices: Show daily prices in calendar

### Updated

- Product calendar. JS Library. Single date => Just one month

## [0.9.1]

Published on npmjs.com

## [0.9.0]

### Added

- Api Key and language API access integration
- Build two bundles:
  - mybooking-js-engine.js (for Static HTML pages)
  - mybooking-js-engine-bundle.js (for WordPress Plugin)
  WordPress bundle does not include jquery and jquery-ui libraries