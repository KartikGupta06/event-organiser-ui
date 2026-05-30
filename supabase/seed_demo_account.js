import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pnxgmkfitdomwrjylcjh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueGdta2ZpdGRvbXdyanlsY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDQwNDAsImV4cCI6MjA5NTM4MDA0MH0.tkHD1o8ZIvrHdSg4DtTCFhIaVbTt-doAmEr7ZhCSccY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

const ADMIN_EMAIL = "admin.demo.eventhub@gmail.com";
const ADMIN_PASSWORD = "AdminDemo123!";

const STUDENT_EMAIL = "student.demo.eventhub@gmail.com";
const STUDENT_PASSWORD = "StudentDemo123!";

async function getOrCreateUser(email, password, fullName) {
  console.log(`Getting or creating user: ${email}...`);
  
  // 1. Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered") || signUpError.message.includes("User already exists")) {
      console.log(`User ${email} already exists, logging in...`);
    } else {
      console.error(`Sign up failed for ${email}:`, signUpError.message);
    }
  }

  // 2. Sign in to get active session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    throw new Error(`Auth failed for ${email}: ${signInError.message}`);
  }

  console.log(`Successfully authenticated as ${email}. User ID: ${signInData.user.id}`);
  return {
    userId: signInData.user.id,
    token: signInData.session.access_token
  };
}

async function seed() {
  console.log("=== STARTING EVENTHUB DEMO DATA SEEDING ===");
  try {
    // -------------------------------------------------------------
    // STEP 1: Set up Admin Account
    // -------------------------------------------------------------
    const adminAuth = await getOrCreateUser(ADMIN_EMAIL, ADMIN_PASSWORD, "Administrator Coordinator");
    
    // Create admin client authenticated as Admin
    const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    await adminClient.auth.setSession({
      access_token: adminAuth.token,
      refresh_token: adminAuth.token // Placeholder
    });

    console.log("Updating admin profile role to 'admin'...");
    const { error: adminProfileError } = await adminClient
      .from('profiles')
      .update({ role: 'admin', full_name: 'Coordinator Coordinator' })
      .eq('user_id', adminAuth.userId);

    if (adminProfileError) {
      console.error("Admin role update error:", adminProfileError);
    } else {
      console.log("Admin account role set successfully!");
    }

    // -------------------------------------------------------------
    // STEP 2: Set up Student Demo Account
    // -------------------------------------------------------------
    const studentAuth = await getOrCreateUser(STUDENT_EMAIL, STUDENT_PASSWORD, "Alex Rivera");
    
    // Create student client authenticated as Student
    const studentClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    await studentClient.auth.setSession({
      access_token: studentAuth.token,
      refresh_token: studentAuth.token // Placeholder
    });

    console.log("Updating student profile metadata...");
    const { error: studentProfileError } = await studentClient
      .from('profiles')
      .update({
        full_name: 'Alex Rivera',
        branch: 'Computer Science & Engineering',
        roll_number: 'CSE-2023-042',
        academic_year: 'Third Year',
        phone_number: '+1 (555) 019-2834',
        bio: 'Passionate full-stack developer, React enthusiast, and college tech club member.',
        role: 'student'
      })
      .eq('user_id', studentAuth.userId);

    if (studentProfileError) {
      console.error("Student profile update error:", studentProfileError);
    } else {
      console.log("Student profile updated successfully!");
    }

    // -------------------------------------------------------------
    // STEP 3: Seed Mock Events (As Admin)
    // -------------------------------------------------------------
    console.log("Seeding mock events as admin...");
    
    const mockEvents = [
      {
        name: "National AI Hackathon 2026",
        description: "A 36-hour intensive hackathon focused on building agentic AI applications. Sponsored by major tech leaders.",
        rules: "1. Team size: 2-4 members. 2. Code must be written entirely during the hackathon. 3. APIs must be verified.",
        registration_link: "https://hackathon.college.edu",
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Closed 5 days ago
        status: "completed",
        created_by: adminAuth.userId
      },
      {
        name: "Advanced React & Next.js Masterclass",
        description: "Deep dive workshop into modern React design paradigms, Server Components, suspense architectures, and advanced custom state synchronization.",
        rules: "Pre-requisites: Basic JavaScript & core React knowledge.",
        registration_link: "https://react-workshop.college.edu",
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // Closes in 12 days
        status: "active",
        created_by: adminAuth.userId
      },
      {
        name: "Google Cloud Fundamentals Workshop",
        description: "Learn core cloud concepts, Kubernetes deployment metrics, and secure database integrations in a fully guided visual hands-on session.",
        rules: "Please bring a laptop with an active Google Account.",
        registration_link: "",
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Closes in 4 days
        status: "active",
        created_by: adminAuth.userId
      }
    ];

    const seededEvents = [];
    for (const eventData of mockEvents) {
      // Check if event already exists
      const { data: existingEvents } = await adminClient
        .from('events')
        .select('*')
        .eq('name', eventData.name);

      if (existingEvents && existingEvents.length > 0) {
        console.log(`Event "${eventData.name}" already seeded.`);
        seededEvents.push(existingEvents[0]);
      } else {
        const { data: newEvent, error: insertError } = await adminClient
          .from('events')
          .insert([eventData])
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to seed event "${eventData.name}":`, insertError.message);
        } else {
          console.log(`Event "${eventData.name}" seeded successfully!`);
          seededEvents.push(newEvent);
        }
      }
    }

    // -------------------------------------------------------------
    // STEP 4: Seed Event Registrations (As Student)
    // -------------------------------------------------------------
    console.log("Seeding event registrations for student demo...");
    for (const event of seededEvents) {
      // Check if already registered
      const { data: existingRegs } = await studentClient
        .from('event_registrations')
        .select('*')
        .eq('event_id', event.id)
        .eq('student_id', studentAuth.userId);

      if (existingRegs && existingRegs.length > 0) {
        console.log(`Student already registered for event "${event.name}".`);
      } else {
        const { error: regError } = await studentClient
          .from('event_registrations')
          .insert([
            {
              event_id: event.id,
              student_id: studentAuth.userId,
              status: event.status === 'completed' ? 'attended' : 'registered',
              student_full_name: 'Alex Rivera',
              student_email: STUDENT_EMAIL,
              student_phone: '+1 (555) 019-2834',
              student_branch: 'Computer Science & Engineering',
              student_roll_number: 'CSE-2023-042',
              student_academic_year: 'Third Year'
            }
          ]);

        if (regError) {
          console.error(`Failed to register for event "${event.name}":`, regError.message);
        } else {
          console.log(`Student registered for event "${event.name}"!`);
        }
      }
    }

    // -------------------------------------------------------------
    // STEP 5: Seed Certificate (As Admin)
    // -------------------------------------------------------------
    console.log("Seeding digital certificate for hackathon completion...");
    const hackathonEvent = seededEvents.find(e => e.name === "National AI Hackathon 2026");

    if (hackathonEvent) {
      // Check if certificate already exists
      const { data: existingCerts } = await adminClient
        .from('certificates')
        .select('*')
        .eq('recipient_user_id', studentAuth.userId)
        .eq('event_name', hackathonEvent.name);

      if (existingCerts && existingCerts.length > 0) {
        console.log("Certificate already seeded.");
      } else {
        const { error: certError } = await adminClient
          .from('certificates')
          .insert([
            {
              name: "National AI Hackathon 2026 - Certificate of Achievement",
              event_name: hackathonEvent.name,
              recipient_user_id: studentAuth.userId,
              recipient_name: "Alex Rivera",
              certificate_type: "achievement",
              download_url: "https://pnxgmkfitdomwrjylcjh.supabase.co/storage/v1/object/public/certificates/sample.pdf?template=gold",
              created_by: adminAuth.userId
            }
          ]);

        if (certError) {
          console.error("Failed to seed certificate:", certError.message);
        } else {
          console.log("Certificate seeded successfully!");
        }
      }
    }

    console.log("=== EVENTHUB DEMO DATA SEEDING COMPLETE ===");
    console.log(`\nDemo Credentials:`);
    console.log(`Student Email:    ${STUDENT_EMAIL}`);
    console.log(`Student Password: ${STUDENT_PASSWORD}`);
    console.log(`Admin Email:      ${ADMIN_EMAIL}`);
    console.log(`Admin Password:   ${ADMIN_PASSWORD}`);
    
  } catch (err) {
    console.error("Unexpected seeding error:", err);
  }
}

seed();
