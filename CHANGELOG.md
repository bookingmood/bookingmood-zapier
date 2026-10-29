## 1.0.2

Update create/invite-member: Include user_profile in responses for member-related endpoints. This way users can see a name / email address instead of some opaque identifier.

## 1.0.3

Update trigger/members: Include user_profile in response.

## 1.0.4

Update trigger/members: Fix user_profile selector.

## 1.0.5

Update trigger/members: Add user_profile to sample data.

## 1.0.6

Update trigger/members: Fix user_profile sample data.

## 1.0.7

Fix #2: Add field validation during authentication.

## 2.0.0

Rebuild on the public OpenAPI spec of the Bookingmood API.

- Fix Create Unit and Invite Member, which called endpoints that no longer exist. Their keys changed to `createProduct` and `inviteMember`, since Zapier no longer allows hyphens.
- Add Revoke Member and Delete Unit.
- Add Update Contact, Update Calendar Event and Update Task.
- Add Find Booking, Find Calendar Event, Find Contact and Find Payment.
- Only ask for an API key. The organization is derived from it, and names the connection.
- Hide the generic create actions of other tables. Existing Zaps that use them keep working. Remove those of tables that no longer exist.
- Sample data of Calendar Event Confirmed/Cancelled, Payment Paid and Task Completed only lists matching rows.
