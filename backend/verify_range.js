const mongoose = require('mongoose');
const Bill = require('./models/Bill');

async function testRange() {
  await mongoose.connect('mongodb://localhost:27017/billmanager_test');
  
  const year = 2026;
  const month = 3;
  
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  console.log('Testing range for March 2026 (UTC):');
  console.log('Start:', start.toISOString());
  console.log('End:  ', end.toISOString());
  
  const expectedStart = '2026-03-01T00:00:00.000Z';
  const expectedEnd = '2026-03-31T23:59:59.999Z';
  
  if (start.toISOString() === expectedStart && end.toISOString() === expectedEnd) {
    console.log('✅ UTC range calculation is correct.');
  } else {
    console.log('❌ UTC range calculation is incorrect.');
  }
  
  process.exit(0);
}

testRange().catch(err => {
  console.error(err);
  process.exit(1);
});
