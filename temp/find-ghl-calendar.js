// Find GoHighLevel Calendar by ID
// Run with: node temp/find-ghl-calendar.js

const API_KEY = 'pit-3b7ddf94-4e92-4e76-b842-331f276b525c';
const BASE_URL = 'https://services.leadconnectorhq.com';
const LOCATION_ID = '1DrJ590uuFroxuiy2iME';
const CALENDAR_ID = '0R4D9EJK9OSWn7bkeVzj';

async function findCalendar() {
  try {
    // Try to get specific calendar
    const response = await fetch(
      `${BASE_URL}/calendars/${CALENDAR_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ Calendar fetch failed: ${response.status} ${response.statusText}`);

      // Try listing all calendars for the location
      console.log('\n📋 Fetching all calendars for location...\n');
      const listResponse = await fetch(
        `${BASE_URL}/calendars/?locationId=${LOCATION_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          }
        }
      );

      if (listResponse.ok) {
        const calendars = await listResponse.json();
        console.log('✅ All Calendars:');
        console.log(JSON.stringify(calendars, null, 2));

        // Search for our calendar ID
        const found = calendars?.calendars?.find(cal => cal.id === CALENDAR_ID);
        if (found) {
          console.log('\n✅ Found calendar:', found);
        } else {
          console.log(`\n⚠️  Calendar ${CALENDAR_ID} not found in list`);
        }
      } else {
        console.log(`❌ List calendars failed: ${listResponse.status}`);
      }
      return;
    }

    const calendar = await response.json();
    console.log('✅ Calendar found:');
    console.log(JSON.stringify(calendar, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findCalendar();
