// src/features/auth/data/signupContent.js

export const signupContent = {
  topBar: {
    text: "Already have an account?",
    button: "Sign In",
  },

  form: {
    title: "Create Doctor Account",
    subtitle: "Join MediScan AI — complete your registration to get started",
    stepBadge: "Step 1 of 4 — Personal Details",

    fields: {
      firstName: {
        label: "FIRST NAME",
        placeholder: "Sarah",
      },
      lastName: {
        label: "LAST NAME",
        placeholder: "Mitchell",
      },
      email: {
        label: "PROFESSIONAL EMAIL",
        placeholder: "dr.sarah@hospital.com",
      },
      phone: {
        label: "PHONE NUMBER",
        placeholder: "+92 300 0000000",
      },
      specialization: {
        label: "MEDICAL SPECIALIZATION",
        placeholder: "Cardiology",
      },
      license: {
        label: "PMC LICENSE NUMBER",
        placeholder: "PMC-12347",
      },
      hospital: {
        label: "AFFILIATED HOSPITAL / CLINIC",
        placeholder: "Shaukat Khanum Memorial Hospital",
      },
      designation: {
        label: "DESIGNATION",
        placeholder: "Senior Consultant",
      },
    },

    uploadTitle: "PROFILE PHOTO (OPTIONAL)",
    uploadText: "Drop your photo here, or browse",
    uploadNote: "PNG, JPG up to 5MB",

    agreement:
      "I agree to the Terms of Service, Privacy Policy, and Medical Data Handling Agreement",

    button: "Continue to License Verification",
    back: "Back to Login",
    copyright: "© 2026 MediScan AI  ·  For Medical Professionals Only",
  },

  rightPanel: {
    brandCyan: "MediScan ",
    brandGreen: "AI",
    title: "REGISTRATION STEPS",

    steps: [
      {
        number: "1",
        title: "Personal Details",
        description: "Name, credentials & contact",
        active: true,
      },
      {
        number: "2",
        title: "Medical License",
        description: "Verify your PMC registration",
        active: false,
      },
      {
        number: "3",
        title: "Hospital Setup",
        description: "Link your hospital or clinic",
        active: false,
      },
      {
        number: "4",
        title: "Account Security",
        description: "Password & 2FA setup",
        active: false,
      },
    ],

    protectedTitle: "YOUR DATA IS PROTECTED",

    protectedItems: [
      "HIPAA Compliant Storage",
      "256-bit SSL Encryption",
      "PMC License Verified",
      "2FA Authentication",
    ],

    quote: "MediScan AI has transformed how I manage patient records.",
    doctor: "Dr. Khalid Mahmood, FCPS Cardiology",
  },
};

export default signupContent;