export interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export const quickPromptCategories = [
  "Forms",
  "Cards",
  "Navigation",
  "Heroes",
  "Footers",
  "Modals",
  "Lists",
  "Buttons",
  "Inputs",
  "Tables",
];

export const quickPrompts: QuickPrompt[] = [
  // Forms (10)
  { id: "form-1", title: "Login Form", prompt: "A modern login form with email and password fields, remember me checkbox, and forgot password link", category: "Forms" },
  { id: "form-2", title: "Registration Form", prompt: "A signup form with name, email, password, confirm password fields and terms checkbox", category: "Forms" },
  { id: "form-3", title: "Contact Form", prompt: "A contact form with name, email, subject, and message textarea with send button", category: "Forms" },
  { id: "form-4", title: "Newsletter Signup", prompt: "A minimal newsletter subscription form with email input and subscribe button", category: "Forms" },
  { id: "form-5", title: "Search Form", prompt: "A search form with input field, filters dropdown, and search button", category: "Forms" },
  { id: "form-6", title: "Checkout Form", prompt: "A checkout form with shipping address, payment details, and order summary", category: "Forms" },
  { id: "form-7", title: "Profile Edit Form", prompt: "A user profile edit form with avatar upload, name, bio, and social links", category: "Forms" },
  { id: "form-8", title: "Feedback Form", prompt: "A feedback form with rating stars, category select, and comment textarea", category: "Forms" },
  { id: "form-9", title: "Password Reset", prompt: "A password reset form with email input and reset button", category: "Forms" },
  { id: "form-10", title: "Multi-step Form", prompt: "A multi-step wizard form with progress indicator and next/back buttons", category: "Forms" },

  // Cards (10)
  { id: "card-1", title: "Product Card", prompt: "A product card with image, title, price, rating stars, and add to cart button", category: "Cards" },
  { id: "card-2", title: "Pricing Card", prompt: "A pricing card with plan name, price, features list, and popular badge", category: "Cards" },
  { id: "card-3", title: "Team Member Card", prompt: "A team member card with avatar, name, role, bio, and social links", category: "Cards" },
  { id: "card-4", title: "Blog Post Card", prompt: "A blog post card with featured image, title, excerpt, author, and date", category: "Cards" },
  { id: "card-5", title: "Testimonial Card", prompt: "A testimonial card with quote, customer photo, name, company, and rating", category: "Cards" },
  { id: "card-6", title: "Feature Card", prompt: "A feature card with icon, title, description, and learn more link", category: "Cards" },
  { id: "card-7", title: "Stats Card", prompt: "A statistics card with large number, label, trend indicator, and chart", category: "Cards" },
  { id: "card-8", title: "Profile Card", prompt: "A user profile card with cover image, avatar, name, stats, and follow button", category: "Cards" },
  { id: "card-9", title: "Event Card", prompt: "An event card with date badge, title, location, time, and register button", category: "Cards" },
  { id: "card-10", title: "Notification Card", prompt: "A notification card with icon, title, message, time, and action buttons", category: "Cards" },

  // Navigation (8)
  { id: "nav-1", title: "Top Navbar", prompt: "A responsive top navigation bar with logo, menu links, and CTA button", category: "Navigation" },
  { id: "nav-2", title: "Sidebar Menu", prompt: "A vertical sidebar navigation with icons, labels, and nested submenus", category: "Navigation" },
  { id: "nav-3", title: "Mega Menu", prompt: "A mega dropdown menu with categories, featured items, and images", category: "Navigation" },
  { id: "nav-4", title: "Breadcrumb", prompt: "A breadcrumb navigation with home icon and current page indicator", category: "Navigation" },
  { id: "nav-5", title: "Tab Navigation", prompt: "A horizontal tab navigation with active state and content panels", category: "Navigation" },
  { id: "nav-6", title: "Mobile Menu", prompt: "A hamburger mobile menu with slide-in animation and close button", category: "Navigation" },
  { id: "nav-7", title: "Pagination", prompt: "A pagination component with page numbers, prev/next arrows, and page size selector", category: "Navigation" },
  { id: "nav-8", title: "Bottom Nav", prompt: "A mobile bottom navigation bar with icons and labels", category: "Navigation" },

  // Heroes (6)
  { id: "hero-1", title: "Hero with Image", prompt: "A hero section with headline, subtext, CTA buttons, and side image", category: "Heroes" },
  { id: "hero-2", title: "Video Hero", prompt: "A hero section with background video, overlay, headline, and CTA", category: "Heroes" },
  { id: "hero-3", title: "Split Hero", prompt: "A split hero with text on left and image/illustration on right", category: "Heroes" },
  { id: "hero-4", title: "Gradient Hero", prompt: "A hero with gradient background, centered text, and animated elements", category: "Heroes" },
  { id: "hero-5", title: "App Hero", prompt: "An app landing hero with phone mockup, features, and download buttons", category: "Heroes" },
  { id: "hero-6", title: "Minimal Hero", prompt: "A minimal hero with large typography and subtle animation", category: "Heroes" },

  // Footers (5)
  { id: "footer-1", title: "Multi-column Footer", prompt: "A footer with logo, navigation columns, newsletter, and social links", category: "Footers" },
  { id: "footer-2", title: "Simple Footer", prompt: "A simple footer with copyright, links, and social icons in one row", category: "Footers" },
  { id: "footer-3", title: "CTA Footer", prompt: "A footer with call-to-action section, contact info, and links", category: "Footers" },
  { id: "footer-4", title: "App Footer", prompt: "A mobile app footer with app store badges and QR code", category: "Footers" },
  { id: "footer-5", title: "Dark Footer", prompt: "A dark themed footer with gradient accent and animated hover effects", category: "Footers" },

  // Modals (5)
  { id: "modal-1", title: "Confirmation Modal", prompt: "A confirmation dialog with title, message, and confirm/cancel buttons", category: "Modals" },
  { id: "modal-2", title: "Image Modal", prompt: "A lightbox modal for displaying images with zoom and navigation", category: "Modals" },
  { id: "modal-3", title: "Form Modal", prompt: "A modal dialog containing a form with inputs and submit button", category: "Modals" },
  { id: "modal-4", title: "Success Modal", prompt: "A success modal with checkmark animation, message, and close button", category: "Modals" },
  { id: "modal-5", title: "Cookie Consent", prompt: "A cookie consent modal with description and accept/decline buttons", category: "Modals" },

  // Lists (4)
  { id: "list-1", title: "Todo List", prompt: "A todo list with checkboxes, task text, and delete buttons", category: "Lists" },
  { id: "list-2", title: "User List", prompt: "A list of users with avatars, names, roles, and action buttons", category: "Lists" },
  { id: "list-3", title: "File List", prompt: "A file list with icons, names, sizes, dates, and download buttons", category: "Lists" },
  { id: "list-4", title: "Activity Feed", prompt: "An activity feed list with user avatars, actions, and timestamps", category: "Lists" },

  // Buttons (4)
  { id: "btn-1", title: "Button Group", prompt: "A group of buttons with primary, secondary, and outline variants", category: "Buttons" },
  { id: "btn-2", title: "Icon Buttons", prompt: "Icon buttons with tooltips for common actions like edit, delete, share", category: "Buttons" },
  { id: "btn-3", title: "Loading Button", prompt: "A button with loading spinner animation and disabled state", category: "Buttons" },
  { id: "btn-4", title: "Social Buttons", prompt: "Social login buttons for Google, Facebook, Twitter, and GitHub", category: "Buttons" },

  // Inputs (4)
  { id: "input-1", title: "Text Input", prompt: "A text input with label, placeholder, helper text, and validation states", category: "Inputs" },
  { id: "input-2", title: "Select Dropdown", prompt: "A select dropdown with search, multi-select, and clear functionality", category: "Inputs" },
  { id: "input-3", title: "Date Picker", prompt: "A date picker input with calendar popup and range selection", category: "Inputs" },
  { id: "input-4", title: "File Upload", prompt: "A drag and drop file upload area with progress bar and preview", category: "Inputs" },

  // Tables (4)
  { id: "table-1", title: "Data Table", prompt: "A data table with sorting, filtering, pagination, and row selection", category: "Tables" },
  { id: "table-2", title: "Pricing Table", prompt: "A comparison pricing table with features, checkmarks, and highlight column", category: "Tables" },
  { id: "table-3", title: "Order Table", prompt: "An order history table with status badges, dates, and action buttons", category: "Tables" },
  { id: "table-4", title: "Leaderboard", prompt: "A leaderboard table with ranks, avatars, names, and scores", category: "Tables" },
];
