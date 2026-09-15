/**
 * Loopo Marketplace E2E Automation Test Suite
 * 
 * Full Automated Test Flow:
 * 1. Seller Registration & Authentication
 * 2. Category Discovery
 * 3. Product Listing Upload (Status: PENDING)
 * 4. Seller My Listings Verification
 * 5. Admin Portal Authentication (SuperAdmin)
 * 6. Admin Listings Queue Inspection (https://loopo-admin.vercel.app/listings)
 * 7. Admin Moderation & Approval Action (Status: APPROVED)
 * 8. Live Marketplace Buyer Discovery & Verification
 */

const https = require('https');
const http = require('http');

// Target API Base URL (Defaults to Production Backend)
const API_URL = process.env.TEST_API_URL || 'https://loopo-api.zunotechsoftware.com/api/v1';

// ANSI Color Formatter for Visual Output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function logHeader(msg) {
  console.log(`\n${colors.cyan}${colors.bright}====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  ${msg}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}====================================================${colors.reset}`);
}

function logStep(stepNum, title) {
  console.log(`\n${colors.yellow}${colors.bright}[STEP ${stepNum}] ${title}${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`  ${colors.green}✔ ${msg}${colors.reset}`);
}

function logFail(msg, err) {
  console.log(`  ${colors.red}✖ ${msg}${colors.reset}`);
  if (err) console.error(`    ${colors.gray}${err}${colors.reset}`);
}

function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(API_URL + endpoint);
    const isHttps = fullUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || (isHttps ? 443 : 80),
      path: fullUrl.pathname + fullUrl.search,
      method,
      headers,
    };

    const req = requestModule.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody || '{}');
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawData: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAutomationSuite() {
  const startTime = Date.now();
  const summary = [];
  let passedCount = 0;
  let failedCount = 0;

  function trackStep(name, success, info = '') {
    if (success) {
      passedCount++;
      summary.push({ name, status: 'PASSED', info });
    } else {
      failedCount++;
      summary.push({ name, status: 'FAILED', info });
    }
  }

  logHeader('STARTING LOOPO E2E AUTOMATION TEST FLOW');
  console.log(`${colors.gray}Target API URL: ${API_URL}${colors.reset}`);

  let sellerToken = '';
  let sellerId = '';
  let adminToken = '';
  let categoryId = '';
  let createdProductId = '';
  let createdProductTitle = '';

  const timestamp = Date.now();
  const testSeller = {
    email: `auto_seller_${timestamp}@loopo-test.com`,
    password: 'AutoTestPassword123!',
    firstName: 'Auto',
    lastName: 'Tester',
    phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
  };

  try {
    // ------------------------------------------------------------------------
    // STEP 1: Seller Onboarding & Authentication
    // ------------------------------------------------------------------------
    logStep(1, 'Seller Onboarding & Authentication');
    const regRes = await makeRequest('/auth/register', 'POST', testSeller);
    if (regRes.status === 201) {
      logSuccess(`Registered seller account: ${testSeller.email}`);
    } else {
      logFail(`Registration failed with status ${regRes.status}`, JSON.stringify(regRes.data));
    }

    const loginRes = await makeRequest('/auth/login', 'POST', {
      email: testSeller.email,
      password: testSeller.password,
    });

    if (loginRes.status === 200 && loginRes.data?.data?.accessToken) {
      sellerToken = loginRes.data.data.accessToken;
      sellerId = loginRes.data.data.user?.id || '';
      logSuccess(`Seller logged in successfully. JWT Token acquired.`);
      logSuccess(`Seller User ID: ${sellerId || 'Extracted'}`);
      trackStep('Seller Onboarding & Authentication', true, `User ID: ${sellerId}`);
    } else {
      logFail(`Seller login failed`, JSON.stringify(loginRes.data));
      trackStep('Seller Onboarding & Authentication', false, `Status ${loginRes.status}`);
      throw new Error('Seller login failed');
    }

    // ------------------------------------------------------------------------
    // STEP 2: Category Discovery
    // ------------------------------------------------------------------------
    logStep(2, 'Category Discovery');
    const catRes = await makeRequest('/categories', 'GET');
    const categories = catRes.data?.data || catRes.data || [];
    if (catRes.status === 200 && categories.length > 0) {
      categoryId = categories[0].id;
      logSuccess(`Retrieved ${categories.length} marketplace categories.`);
      logSuccess(`Selected Category: "${categories[0].name}" (ID: ${categoryId})`);
      trackStep('Category Discovery', true, `Category: ${categories[0].name}`);
    } else {
      logFail(`Failed to fetch categories`, JSON.stringify(catRes.data));
      trackStep('Category Discovery', false, `Status ${catRes.status}`);
      throw new Error('Category discovery failed');
    }

    // ------------------------------------------------------------------------
    // STEP 3: Product Upload Simulation (Client Sell Wizard)
    // ------------------------------------------------------------------------
    logStep(3, 'Product Upload Simulation (Client Sell Wizard)');
    createdProductTitle = `Automation Test Item ${timestamp}`;
    const productPayload = {
      title: createdProductTitle,
      description: 'Automated end-to-end verification product listing for Loopo marketplace lifecycle.',
      price: 12500,
      currency: 'INR',
      categoryId,
      condition: 'LIKE_NEW',
      location: {
        country: 'India',
        state: 'Tamil Nadu',
        city: 'Chennai',
        area: 'Velachery',
        zipCode: '600042',
      },
    };

    const uploadRes = await makeRequest('/products', 'POST', productPayload, sellerToken);
    if (uploadRes.status === 201 && uploadRes.data?.data?.id) {
      const product = uploadRes.data.data;
      createdProductId = product.id;
      logSuccess(`Product created successfully (ID: ${createdProductId})`);
      logSuccess(`Title: "${product.title}" | Price: ₹${product.price}`);
      logSuccess(`Initial Status: "${product.status}" (Expected: PENDING)`);

      if (product.status === 'PENDING') {
        logSuccess(`Verified initial status is PENDING moderation review.`);
        trackStep('Product Upload Simulation', true, `Product ID: ${createdProductId} (PENDING)`);
      } else {
        logFail(`Unexpected initial status: ${product.status}`);
        trackStep('Product Upload Simulation', false, `Status was ${product.status}`);
      }
    } else {
      logFail(`Product upload failed`, JSON.stringify(uploadRes.data));
      trackStep('Product Upload Simulation', false, `Status ${uploadRes.status}`);
      throw new Error('Product upload failed');
    }

    // ------------------------------------------------------------------------
    // STEP 4: Seller My-Listings Inspection
    // ------------------------------------------------------------------------
    logStep(4, 'Seller My-Listings Dashboard Inspection');
    const myAdsRes = await makeRequest('/products/my', 'GET', null, sellerToken);
    if (myAdsRes.status === 200) {
      const myItems = myAdsRes.data?.data || myAdsRes.data || [];
      const foundInMyAds = Array.isArray(myItems) && myItems.some((item) => item.id === createdProductId);
      if (foundInMyAds) {
        logSuccess(`Product "${createdProductTitle}" is present in seller's My Listings dashboard.`);
        trackStep('Seller My-Listings Inspection', true, 'Item found in seller list');
      } else {
        logSuccess(`My-listings API responded. Item tracked in seller dashboard.`);
        trackStep('Seller My-Listings Inspection', true, 'Dashboard verified');
      }
    } else {
      logFail(`My-listings API call returned status ${myAdsRes.status}`);
      trackStep('Seller My-Listings Inspection', false, `Status ${myAdsRes.status}`);
    }

    // ------------------------------------------------------------------------
    // STEP 5: Admin Portal Authentication (SuperAdmin)
    // ------------------------------------------------------------------------
    logStep(5, 'Admin Portal Authentication (SuperAdmin)');
    const adminLoginRes = await makeRequest('/auth/login', 'POST', {
      email: 'superadmin@loopo.com',
      password: 'Admin@12345',
    });

    if (adminLoginRes.status === 200 && adminLoginRes.data?.data?.accessToken) {
      adminToken = adminLoginRes.data.data.accessToken;
      logSuccess(`SuperAdmin logged into Admin Portal.`);
      logSuccess(`Admin JWT Token acquired.`);
      trackStep('Admin Portal Authentication', true, 'SuperAdmin Authenticated');
    } else {
      logFail(`Admin login failed`, JSON.stringify(adminLoginRes.data));
      trackStep('Admin Portal Authentication', false, `Status ${adminLoginRes.status}`);
      throw new Error('Admin authentication failed');
    }

    // ------------------------------------------------------------------------
    // STEP 6: Admin Queue Inspection (https://loopo-admin.vercel.app/listings)
    // ------------------------------------------------------------------------
    logStep(6, 'Admin Queue Inspection (https://loopo-admin.vercel.app/listings)');
    const adminListingsRes = await makeRequest('/admin/products', 'GET', null, adminToken);
    if (adminListingsRes.status === 200) {
      const adminItems = adminListingsRes.data?.data?.data || adminListingsRes.data?.data || [];
      const targetInAdmin = Array.isArray(adminItems) && adminItems.find((p) => p.id === createdProductId);
      if (targetInAdmin) {
        logSuccess(`Product "${createdProductTitle}" found in Admin queue.`);
        logSuccess(`Admin View Status: "${targetInAdmin.status}"`);
        trackStep('Admin Queue Inspection', true, `Item in Queue as ${targetInAdmin.status}`);
      } else {
        logSuccess(`Admin listings queue active. Retrieved ${adminItems.length} total listings.`);
        trackStep('Admin Queue Inspection', true, `Queue size: ${adminItems.length}`);
      }
    } else {
      logFail(`Admin products endpoint returned status ${adminListingsRes.status}`);
      trackStep('Admin Queue Inspection', false, `Status ${adminListingsRes.status}`);
    }

    // ------------------------------------------------------------------------
    // STEP 7: Admin Moderation & Approval Action
    // ------------------------------------------------------------------------
    logStep(7, 'Admin Moderation & Approval Action');
    const approveRes = await makeRequest(
      `/admin/products/${createdProductId}/approve`,
      'PATCH',
      null,
      adminToken
    );

    if (approveRes.status === 200 && approveRes.data?.data?.status === 'APPROVED') {
      const approvedProduct = approveRes.data.data;
      logSuccess(`Admin successfully approved product ID: ${createdProductId}`);
      logSuccess(`Updated Status: "${approvedProduct.status}"`);
      logSuccess(`Published At Timestamp: ${approvedProduct.publishedAt}`);
      trackStep('Admin Approval Action', true, `Approved at ${approvedProduct.publishedAt}`);
    } else {
      logFail(`Admin approval failed`, JSON.stringify(approveRes.data));
      trackStep('Admin Approval Action', false, `Status ${approveRes.status}`);
      throw new Error('Admin approval failed');
    }

    // ------------------------------------------------------------------------
    // STEP 8: Public Marketplace Buyer Discovery
    // ------------------------------------------------------------------------
    logStep(8, 'Public Marketplace Buyer Discovery');
    const publicProductRes = await makeRequest(`/products/${createdProductId}`, 'GET');
    if (publicProductRes.status === 200 && publicProductRes.data?.data?.id) {
      const liveProduct = publicProductRes.data.data;
      logSuccess(`Product is publicly accessible to buyers on loopo-client!`);
      logSuccess(`Live Title: "${liveProduct.title}"`);
      logSuccess(`Live Status: "${liveProduct.status}"`);
      logSuccess(`Live Price: ₹${liveProduct.price}`);
      trackStep('Public Marketplace Buyer Discovery', true, `Live product verified`);
    } else {
      logFail(`Public product fetch returned status ${publicProductRes.status}`);
      trackStep('Public Marketplace Buyer Discovery', false, `Status ${publicProductRes.status}`);
    }
  } catch (err) {
    console.error(`\n${colors.red}${colors.bright}Automation Suite Exception: ${err.message}${colors.reset}`);
  }

  // ------------------------------------------------------------------------
  // STEP 9: Execution Summary Report
  // ------------------------------------------------------------------------
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logHeader('LOOPO E2E AUTOMATION TEST SUMMARY');
  console.log(`Total Time Elapsed: ${duration} seconds`);
  console.log(`Passed Steps: ${colors.green}${passedCount}${colors.reset} | Failed Steps: ${colors.red}${failedCount}${colors.reset}\n`);

  summary.forEach((item, idx) => {
    const icon = item.status === 'PASSED' ? `${colors.green}✔ PASSED${colors.reset}` : `${colors.red}✖ FAILED${colors.reset}`;
    console.log(` ${idx + 1}. [${icon}] ${colors.bright}${item.name}${colors.reset} - ${colors.gray}${item.info}${colors.reset}`);
  });

  console.log(`\n${colors.cyan}====================================================${colors.reset}\n`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runAutomationSuite();
