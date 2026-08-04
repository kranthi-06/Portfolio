import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const adminAuthClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const results = {
  passed: [],
  failed: [],
};

function pass(name) {
  console.log(`✅ Passed: ${name}`);
  results.passed.push(name);
}

function fail(name, error) {
  console.error(`❌ Failed: ${name}`);
  console.error(`   Reason:`, error?.message || error);
  results.failed.push({ name, error: error?.message || error });
}

async function runTests() {
  console.log("🚀 Starting Comprehensive End-to-End Verification Pipeline...\n");

  let testUser = null;
  let authenticatedClient = null;
  let testProjectPath = "";

  try {
    // --- PHASE 1: Schema & Buckets Validation ---
    console.log("--- PHASE 1: Schema Validation ---");
    // We test this implicitly by inserting into all tables.
    // We can also query pg_catalog if we had Postgres access, but we'll use the REST API.
    
    // Check buckets via REST using Service Key
    const { data: buckets, error: bucketError } = await adminAuthClient.storage.listBuckets();
    if (bucketError) throw bucketError;
    const requiredBuckets = ['certificates', 'events', 'gallery', 'projects', 'resume', 'documents', 'avatars', 'temporary'];
    const existingBuckets = buckets.map(b => b.id);
    for (const rb of requiredBuckets) {
      if (!existingBuckets.includes(rb)) throw new Error(`Bucket missing: ${rb}`);
    }
    pass("Phase 1: All required storage buckets exist");

    // --- PHASE 2: Authentication ---
    console.log("\n--- PHASE 2: Authentication ---");
    const testEmail = `e2e-test-${Date.now()}@gmail.com`;
    const testPassword = "securePassword123!";
    
    const { data: userData, error: userError } = await adminAuthClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    if (userError) throw userError;
    testUser = userData.user;
    
    if (!testUser) throw new Error("Failed to create test user");
    pass("Phase 2: Authentication signup works");

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (signInError) throw signInError;
    const session = signInData.session;
    authenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });

    // We removed the profiles check as the application doesn't query it.

    // --- PHASE 3: Storage Upload Tests ---
    console.log("\n--- PHASE 3: Upload Tests ---");
    const mockImage = new Blob(["mock-image-data"], { type: "image/jpeg" });
    const mockPdf = new Blob(["mock-pdf-data"], { type: "application/pdf" });

    const uploadTasks = [
      { bucket: 'projects', file: mockImage, name: 'Project image upload', ext: 'jpg' },
      { bucket: 'certificates', file: mockPdf, name: 'Certificate PDF upload', ext: 'pdf' },
      { bucket: 'resume', file: mockPdf, name: 'Resume upload', ext: 'pdf' },
      { bucket: 'gallery', file: mockImage, name: 'Gallery upload', ext: 'jpg' },
      { bucket: 'events', file: mockImage, name: 'Event image upload', ext: 'jpg' },
      { bucket: 'temporary', file: mockImage, name: 'Achievement image upload (Temporary)', ext: 'jpg' },
    ];

    const uploadedPaths = {};

    for (const task of uploadTasks) {
      const fileName = `test-${Date.now()}.${task.ext}`;
      const { data, error } = await authenticatedClient.storage.from(task.bucket).upload(fileName, task.file);
      if (error) {
        fail(task.name, error);
      } else {
        uploadedPaths[task.bucket] = data.path;
        pass(task.name);
      }
    }

    // --- PHASE 5: CRUD Tests for every module ---
    console.log("\n--- PHASE 5: CRUD Tests ---");
    
    const modules = [
      { table: 'projects', data: { title: 'Test Project', status: 'published' }, update: { title: 'Updated Project' } },
      { table: 'certificates', data: { title: 'Test Cert', file_url: 'http://test', file_type: 'pdf', status: 'published' }, update: { title: 'Updated Cert' } },
      { table: 'gallery', data: { image_url: 'http://test', status: 'published' }, update: { caption: 'Updated' } },
      { table: 'experience', data: { title: 'Test Exp', company: 'Test Corp', start_date: '2023-01-01', status: 'published' }, update: { title: 'Updated Exp' } },
      { table: 'skills', data: { name: 'Test Skill', level: 90, status: 'published' }, update: { level: 95 } },
      { table: 'achievements', data: { title: 'Test Achievement', status: 'published' }, update: { title: 'Updated Achievement' } },
      { table: 'events', data: { name: 'Test Event', status: 'published' }, update: { name: 'Updated Event' } },
      { table: 'resume', data: { file_url: 'http://test', file_name: 'resume.pdf', file_size: 100 }, update: { file_size: 200 } }
    ];

    for (const mod of modules) {
      // Create
      const { data: insData, error: insErr } = await authenticatedClient.from(mod.table).insert(mod.data).select().single();
      if (insErr) {
        fail(`CRUD: Create ${mod.table}`, insErr);
        continue;
      }
      const id = insData.id;
      
      // Read
      const { data: readData, error: readErr } = await authenticatedClient.from(mod.table).select('*').eq('id', id).single();
      if (readErr) fail(`CRUD: Read ${mod.table}`, readErr);

      // Update
      const { error: updErr } = await authenticatedClient.from(mod.table).update(mod.update).eq('id', id);
      if (updErr) fail(`CRUD: Update ${mod.table}`, updErr);

      // Delete
      const { error: delErr } = await authenticatedClient.from(mod.table).delete().eq('id', id);
      if (delErr) fail(`CRUD: Delete ${mod.table}`, delErr);
      else pass(`CRUD operations for ${mod.table}`);
    }

    // Storage cleanup verification
    console.log("\n--- Storage Deletion Verification ---");
    for (const [bucket, path] of Object.entries(uploadedPaths)) {
      const { error } = await authenticatedClient.storage.from(bucket).remove([path]);
      if (error) fail(`Storage Deletion: ${bucket}`, error);
      else pass(`Storage Deletion: ${bucket}`);
    }

  } catch (err) {
    fail("Fatal Execution Error", err);
  } finally {
    if (testUser) {
      await adminAuthClient.auth.admin.deleteUser(testUser.id);
      console.log(`\n🧹 Cleaned up test user: ${testUser.id}`);
    }
    
    console.log("\n==========================================");
    console.log("📊 FINAL VERIFICATION REPORT");
    console.log("==========================================");
    console.log(`Passed Tests: ${results.passed.length}`);
    console.log(`Failed Tests: ${results.failed.length}`);
    if (results.failed.length > 0) {
      console.log("\nRemaining Issues:");
      results.failed.forEach(i => console.log(`- ${i.name}: ${i.error}`));
      process.exit(1);
    } else {
      console.log("\n🎉 ALL TESTS PASSED!");
    }
  }
}

runTests();
