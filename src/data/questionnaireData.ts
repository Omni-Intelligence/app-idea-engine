
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  question: string;
  placeholder: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
  required?: boolean;
  type?: 'single' | 'multiple' | 'text';
}

export const questions: Question[] = [
  {
    question: "What type of application do you want to build?",
    placeholder: "Select all that apply to your project...",
    type: 'multiple',
    allowMultiple: true,
    options: [
      { 
        value: "web-app", 
        label: "Web Application",
        description: "A full-featured application accessible through web browsers"
      },
      { 
        value: "mobile-app", 
        label: "Mobile Application",
        description: "An app optimized for mobile devices"
      },
      { 
        value: "ai-tool", 
        label: "AI-powered Tool",
        description: "Application leveraging artificial intelligence capabilities"
      },
      { 
        value: "automation", 
        label: "Automation Solution",
        description: "Tool to automate repetitive tasks or workflows"
      },
      { 
        value: "saas", 
        label: "SaaS Platform",
        description: "Software as a Service with subscription-based model"
      },
      { 
        value: "marketplace", 
        label: "Online Marketplace",
        description: "Platform connecting buyers and sellers"
      },
      { 
        value: "dashboard", 
        label: "Analytics Dashboard",
        description: "Data visualization and reporting interface"
      },
      { 
        value: "api", 
        label: "API Service",
        description: "Backend service providing data through APIs"
      }
    ]
  },
  {
    question: "What specific features or modules do you need?",
    placeholder: "Select all the features that your application requires...",
    type: 'multiple',
    allowMultiple: true,
    options: [
      {
        value: "auth",
        label: "User Authentication",
        description: "Login, registration, password reset functionality"
      },
      {
        value: "user-profiles",
        label: "User Profiles",
        description: "Customizable user profiles and settings"
      },
      {
        value: "data-analytics",
        label: "Data Analytics",
        description: "Data processing, visualization, and reporting"
      },
      {
        value: "file-management",
        label: "File Management",
        description: "Upload, storage, and file organization"
      },
      {
        value: "notifications",
        label: "Notifications System",
        description: "Email, push, or in-app notifications"
      },
      {
        value: "search",
        label: "Search Functionality",
        description: "Advanced search and filtering capabilities"
      },
      {
        value: "admin-panel",
        label: "Admin Dashboard",
        description: "Administrative interface for management"
      },
      {
        value: "api-integration",
        label: "Third-party Integrations",
        description: "Connection with external services and APIs"
      }
    ]
  },
  {
    question: "What type of data will your application handle?",
    placeholder: "Select all relevant data types...",
    type: 'multiple',
    allowMultiple: true,
    options: [
      {
        value: "user-data",
        label: "User Data",
        description: "Personal information and user preferences"
      },
      {
        value: "financial-data",
        label: "Financial Data",
        description: "Payment information, transactions, invoices"
      },
      {
        value: "content",
        label: "Content Management",
        description: "Articles, posts, media files"
      },
      {
        value: "analytics-data",
        label: "Analytics Data",
        description: "Usage statistics, metrics, performance data"
      },
      {
        value: "real-time-data",
        label: "Real-time Data",
        description: "Live updates and streaming information"
      },
      {
        value: "location-data",
        label: "Location Data",
        description: "Geographic information and mapping"
      },
      {
        value: "product-data",
        label: "Product Data",
        description: "Product information, inventory, pricing"
      },
      {
        value: "communication-data",
        label: "Communication Data",
        description: "Messages, comments, chat history"
      }
    ]
  },
  {
    question: "What are your integration requirements?",
    placeholder: "Select all integrations you need...",
    type: 'multiple',
    allowMultiple: true,
    options: [
      {
        value: "payment-processing",
        label: "Payment Processing",
        description: "Stripe, PayPal, or other payment gateways"
      },
      {
        value: "email-service",
        label: "Email Service",
        description: "SendGrid, Mailchimp, or other email providers"
      },
      {
        value: "social-media",
        label: "Social Media",
        description: "Facebook, Twitter, LinkedIn integration"
      },
      {
        value: "cloud-storage",
        label: "Cloud Storage",
        description: "AWS S3, Google Cloud Storage, etc."
      },
      {
        value: "analytics-tools",
        label: "Analytics Tools",
        description: "Google Analytics, Mixpanel, etc."
      },
      {
        value: "crm",
        label: "CRM Systems",
        description: "Salesforce, HubSpot, etc."
      },
      {
        value: "communication-apis",
        label: "Communication APIs",
        description: "Twilio, SendBird, etc."
      },
      {
        value: "ai-services",
        label: "AI Services",
        description: "OpenAI, Google AI, etc."
      }
    ]
  },
  {
    question: "What are your security requirements?",
    placeholder: "Select all security features needed...",
    type: 'multiple',
    allowMultiple: true,
    options: [
      {
        value: "user-auth",
        label: "User Authentication",
        description: "Secure login and registration system"
      },
      {
        value: "data-encryption",
        label: "Data Encryption",
        description: "Encryption at rest and in transit"
      },
      {
        value: "access-control",
        label: "Access Control",
        description: "Role-based access control (RBAC)"
      },
      {
        value: "audit-logging",
        label: "Audit Logging",
        description: "Activity tracking and audit trails"
      },
      {
        value: "compliance",
        label: "Compliance",
        description: "GDPR, HIPAA, or other regulations"
      },
      {
        value: "backup-recovery",
        label: "Backup & Recovery",
        description: "Data backup and disaster recovery"
      },
      {
        value: "security-monitoring",
        label: "Security Monitoring",
        description: "Threat detection and monitoring"
      },
      {
        value: "api-security",
        label: "API Security",
        description: "Secure API authentication and authorization"
      }
    ]
  }
];
