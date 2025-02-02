# Changelog

## [2.4.1] - 2025.01.11

### New

- Calendar widget with rental location customized

## [2.3.2] - 2024.09.23

### New

- Hospedajes y alquileres de vehiculos required fields in my reservation form

## [2.3.1] - 2024.08.14

### New

- Renting Choose product - Filters and progressive loading

## [2.3.0] - 2024.06.26

### Improve

- Rent My reservation : Validation of fields + upload documents and sign contract integration

### Fixed

- Rent selector : Modify dates preload durations
- Planning : Reservations that start before the first date
- Checkout mediator - Improve behaviour allowing an extra validation on the checkout process or allow to
  offer extras or coverages.
- Selector with rental location and duration - rental_location_code param was not used
- Product calendar min days check on select dates
- Product calendar min days warning message
- Product calendar performance_id shortcode parameter
- Product calendar when not performances
- Renting optimization : Improve speed by avoiding one call to settings 
- Rent Selector - Date and duration. Duration was not activated on select date
- Fixed simple_location_id in modify reservation
- Fixed duration errors in modify selector

## [2.1.0] - 2024.02.13

### New

- Multiple tenants configuration in one plugin using parameters

## [2.0.0] - 2023.12.20

### New

- Prefill selector with default values
- Multiple rates management
- Prepare plugin V2

## [1.1.5] - 2023.09.25

### Fixed

- Date Control to manage date before current date
- Added new country fields to selector

## [1.1.4] - 2023.07.31

### Added

- Renting : Selector Wizard
- Checkout and contact : Privacy policy

## [1.1.3] - 2023.06.21

### Added

- Renting - Include rental location in search with non exclusive categories for rental location

### Fixed

- Planning - Was showing reservations in differents dates

## [1.1.2] - 2023.05.25

### Added

- Renting - Shift picker
- Renting - Skipper and driving license management

## [1.1.1] - 2023.05.22

### Added

- Renting - Simple Location

### Fixed

- Renting - Variants : Price in modal
- Activities - My reservation update customers data
- Renting - Passengers validation
- Duplicate tab management
- Activities: My reservation - Update data was not worked since Babel

## [1.1.0] 2023-04-06

### Added

- Passengers management

## [1.0.13] 2023-02-08

### Fixed

- Planning and weekly planning - fixed for Elementor preview

## [1.0.12] 2023-02-03

### Added
- Renting - Product variants
- Planning
- Weekly planning
- Babel integration

## [1.0.11] 2022-10-26

### Added

- Configuration : Added hidePriceIfNotAvailable

## [1.0.10] 2022-07-30

### Added

- Renting Product calendar : Load shopping cart
- Renting Product calendar : Turns
- Renting Complete : Time slots and skipper if necessary
- Renting my reservation : Additional drivers

## [1.0.9]

### Added

- Additional driver 1 and 2 information on my reservation

### Fixed

- Rent Product Calendar: Filter rental location by product
- Complete : Use mybooking company country code for phone numbers

## [1.0.8]

### Added

- Renting Product Calendar: Rental Location selector
- Renting Product Calendar: Show selected period
- Renting Product Calendar: Show only 1 month

## [1.0.7]

### Added

- AgentId extraction outside renting selector

### Fixed

- Manage duplicate Tabs during the renting reservation process
- Renting: Manage stock not available when creating renting reservation
- Avoid double click on create reservation form

## [1.0.6]

### Fixed

- Activities my reservation : Paypal + Credit Card payment method
- Renting my reservation : Paypal + Credit Card payment method
- Product calendar : Send rental location to API (multiple rental locations)
- Renting choose product : Send rental location to API (multiple rental locations)

## [1.0.5]

### Added

- Product duration : selector, choose product, complete, summary, my reservation
- Product calendar turns
- Product calendar duration scope : In One Day vs Days

## [1.0.4]

### Added

- Renting Checkout Form : Phone dial code
- Activities Checkout Form : Phone dial code
- Transfer Checkout Form : Phone dial code
- Transfer selector : Use select2 to choose the pickup and dropoff places
- Activities Cyclic Calendar: First Date
- Product Calendar: First date + Show daily prices + Show minimum dates

### Updated

- Updated select2 to 4.0.13

## [1.0.3]

### Added

- Transfer supplements
- Transfer billing address

### Fixed

- Product detail: Show gallery + info
- Extra detail: Show gallery + info
- Transfer my reservation : Payment

## [1.0.2]

### Fixed

- Renting choose product selection: Default layout by template

## [1.0.1]

### Added

- Renting Reservation : Control if the reservation form should be shown or not

## [1.0.0]

### Added

- Remove bootstrap dependency
  - modal : Use mbModal (fork of jquerymodal) instead of bootstrap modal appending the 
    suffix \_MBM at the modal element ID. If not it will still be using bootstrap modal
  - slider : Use slick
- New Transfer module  

## [0.9.29]

### Added

- Date Range Picker : Added Catalan translation
- Renting : Hide Prices if zero settings
- Renting : Manage Customer classifier

### Fixed

- Product calendar : Fixed rental location when AJAX request
- Activity Cyclic : Performace status value 3 => Date not posible due to anticipation

## [0.9.28]

### Added

- Renting Selector: Extract querystring arguments and and create hidden fields (It is necessary
  to integrate the component with external components => For example Transposh plugin)

### Fixed

- Activities: Multiple payment methods not redirecting to payment gateway
- Renting : Complete -> Summary URL with querystring parameters : Append the booking Id
- Renting : Summary and My Reservation -> Do not manage customer language URL

### Added

- Product search: Price range filter

## [0.9.27]

### Added

- Password Forgotten and Password Change components
- Product Search component
- Date Control Russian translations
- Added Rental Location Code to :
  - Rent Selector (select or hidden input)
  - Rent Selector Wizard (hidden input)
  - Product Calendar (hidden input)

## [0.9.26]

### Added

- Russian translation

### Fixed

- Renting reservation: confirm email field

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