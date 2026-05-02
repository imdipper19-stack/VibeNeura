UPDATE DIRECTIVE: Mobile UI/UX Overhaul & Performance Optimization
Context: The current mobile UI for the chat interface is lagging, components are overlapping (Z-index issues), and the input field is cluttered. We need a complete mobile UI refactor following the "Neural Abyss" deep-dark aesthetic.

Please execute the following 3 phases in the Next.js React components using Tailwind CSS:

Phase 1: Performance & Emergency Layout Fixes
Fix Mobile Lag (CSS Optimization): The heavy lag is likely caused by excessive backdrop-filter: blur.

Action: Remove backdrop-blur from generic container elements. Replace it with solid translucent backgrounds (e.g., bg-slate-900/80). Keep the glassmorphism blur ONLY on the sticky header and the main Paywall modal.

Remove Z-index Conflicts:

Action: Hide the floating customer support chat widget on mobile viewports (hidden md:flex). It is currently blocking the Send button.

Input Bar Refactor (The "Pill"):

Action: Completely redesign the bottom input container. Remove all the clutter icons (paperclip, small camera, globe).

Structure: Create a single, sleek, rounded "pill" container.

Left Side: A massive, prominent Camera button with a subtle cyan glow (shadow-[0_0_15px_rgba(0,255,255,0.3)]).

Center: The text <input> or <textarea> (auto-expanding).

Right Side: A minimalist Send arrow button and a minimal Microphone icon for future voice-to-text.

Phase 2: Visual Polish (Neural Abyss Aesthetic)
Sticky Header: * Make the top header sticky top-0 z-50 with a clean glassmorphism effect.

Remove the "via anthropic" text to reduce visual noise. Ensure the model selector dropdown looks premium.

Prompt Cards (Quick Actions):

Update the 4 grid cards ("Объясни этот код", etc.).

Make borders ultra-thin (border border-cyan-500/20).

Add a subtle hover/active state glow. Improve text contrast so it's easily readable on mobile screens.

Phase 3: UX Feature Implementations
Direct Camera Access: * Update the massive Camera button to trigger the device camera directly rather than just opening the file explorer. Use <input type="file" accept="image/*" capture="environment" className="hidden" /> linked to the button via a useRef.

Mobile Navigation Gesture:

Ensure the hamburger menu (sidebar toggle) is easily accessible. If possible within the current state management, add swipe-to-open logic for the left sidebar so users can access chat history effortlessly.

Execution: Please analyze the current chat page component and layout files, apply these Tailwind/React updates, and ensure the UI is fully responsive and lag-free on mobile devices.