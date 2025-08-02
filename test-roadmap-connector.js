// Simple test script to login and navigate to roadmap
// Run with: node test-roadmap-connector.js

const BASE_URL = "http://localhost:3000";

async function testRoadmapConnector() {
  console.log("Testing RoadmapConnector visibility...");

  // Navigate to roadmap page with test data
  const roadmapUrl = `${BASE_URL}/roadmap?testMode=true`;
  console.log(`Navigate to: ${roadmapUrl}`);
  console.log("This will load the roadmap page with test data (no login required)");
  console.log("\nTo debug the RoadmapConnector issue:");
  console.log("1. Open the browser developer tools");
  console.log("2. Navigate to the Elements tab");
  console.log('3. Search for "RoadmapConnector" in the Elements');
  console.log("4. Check the computed styles for the connector elements");
}

testRoadmapConnector();
