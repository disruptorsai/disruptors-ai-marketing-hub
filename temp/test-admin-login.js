/**
 * Test script for simplified Admin Nexus login validation
 * Tests the allowed names logic from MatrixLogin.jsx
 */

const ALLOWED_NAMES = ['josh', 'tyler', 'carson', 'will', 'kyle'];

function testLogin(inputName) {
  const enteredName = inputName.trim().toLowerCase();
  const isAllowed = ALLOWED_NAMES.includes(enteredName);

  return {
    input: inputName,
    normalized: enteredName,
    allowed: isAllowed,
    message: isAllowed
      ? `✅ ACCESS GRANTED - Welcome, ${enteredName.toUpperCase()}`
      : `❌ ACCESS DENIED - ${inputName} is not authorized`
  };
}

console.log('🔐 Admin Nexus Login Validation Test\n');
console.log('Allowed names:', ALLOWED_NAMES.join(', '));
console.log('\n' + '='.repeat(60) + '\n');

// Test valid names
console.log('VALID NAMES (Should Grant Access):');
['josh', 'TYLER', 'Carson', '  will  ', 'KYLE'].forEach(name => {
  const result = testLogin(name);
  console.log(result.message);
});

console.log('\n' + '='.repeat(60) + '\n');

// Test invalid names
console.log('INVALID NAMES (Should Deny Access):');
['john', 'admin', 'root', 'josh123', 'Will Welsh', ''].forEach(name => {
  const result = testLogin(name);
  console.log(result.message);
});

console.log('\n' + '='.repeat(60) + '\n');

// Test case sensitivity
console.log('CASE SENSITIVITY TEST:');
const caseTests = [
  { input: 'JOSH', expected: true },
  { input: 'josh', expected: true },
  { input: 'JoSh', expected: true },
  { input: 'Tyler', expected: true },
  { input: 'TYLER', expected: true }
];

caseTests.forEach(test => {
  const result = testLogin(test.input);
  const passed = result.allowed === test.expected;
  console.log(`${passed ? '✅' : '❌'} "${test.input}" → ${result.allowed ? 'ALLOWED' : 'DENIED'}`);
});

console.log('\n✨ All validation tests complete!\n');
