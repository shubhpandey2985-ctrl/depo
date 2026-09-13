# DEEPTECH — UI/UX DEVELOPMENT RULES

These rules govern the design and implementation of the DeepTech frontend.

The goal is to create a polished, production-quality product interface — not a collection of disconnected mockup screens.

==================================================
1. GENERAL RULE
==================================================

Build DeepTech as a real product.

Do not create a visual prototype where buttons, filters and navigation are merely decorative.

Every important interaction shown in the UI should have a meaningful frontend behavior.

The interface should feel complete even when using mock/local data.

Do not leave obvious placeholder sections such as:

“Lorem ipsum”
“Coming soon”
“Button”
“Test”
“Sample text”

Use realistic product content.

==================================================
2. DESIGN BEFORE IMPLEMENTATION
==================================================

Before implementing individual screens:

1. Establish the visual language.
2. Establish typography hierarchy.
3. Establish spacing rules.
4. Establish component patterns.
5. Establish navigation behavior.
6. Establish responsive behavior.
7. Then implement the screens.

Do not design each page independently.

Every screen must feel like part of the same DeepTech product.

==================================================
3. NO GENERIC UI
==================================================

Do not use default component-library styling without customization.

Avoid the typical:

Sidebar
+
Topbar
+
Four identical cards
+
Large table
+
Purple button

pattern.

Do not make every section a card.

Do not make every card identical.

Do not make every element heavily rounded.

Do not use excessive gradients.

Do not use generic dashboard templates.

The final result should not look like it came directly from a Tailwind component library.

==================================================
4. BRAND CONSISTENCY
==================================================

The product name is:

DeepTech

Subtitle:

innovation centre

Use the exact branding consistently.

Typography:

Grand Hotel
+
Lato

Grand Hotel should primarily be used for:

- DeepTech wordmark
- selected large editorial headings
- short expressive visual moments

Lato should be used for:

- navigation
- body text
- buttons
- labels
- forms
- tables
- metadata
- numbers
- filters
- notifications

Never replace these fonts with generic alternatives unless technically unavoidable.

==================================================
5. TYPOGRAPHY RULES
==================================================

Typography must create hierarchy.

Use meaningful differences between:

Display
H1
H2
H3
Body
Label
Caption
Metadata

Do not make every heading the same size.

Do not use huge headings simply to fill space.

Grand Hotel should remain visually special.

Do not use Grand Hotel for:

- paragraphs
- tables
- forms
- navigation
- long descriptions
- dense information

Lato must remain highly readable.

==================================================
6. COLOR RULES
==================================================

Primary background:

#F7F8FC

Primary text:

#18213B

Accent:

#6C5CE7
#5E8BFF

Supporting:

#EEEAFE
#E7F4FF
#DFF7EE
#FFF1C9
#FFE3E2

Use color intentionally.

Do not turn the entire interface purple or blue.

Accent colors should communicate:

interaction
status
focus
importance
categorization

rather than decoration.

Maintain accessible contrast.

Never communicate critical information through color alone.

==================================================
7. SPACING
==================================================

Use an 8px spacing system.

Maintain consistent:

- page padding
- section spacing
- component padding
- input spacing
- table row spacing
- navigation spacing

Use whitespace deliberately.

Do not fill every empty area.

Whitespace is part of the design.

==================================================
8. LAYOUT
==================================================

Do not force every screen into the same grid.

Use:

- asymmetric layouts
- offset sections
- different content widths
- editorial compositions
- large and small content blocks
- intentional whitespace

However, unconventional layouts must remain usable.

Do not sacrifice usability just to make the interface look different.

==================================================
9. COMPONENT REUSE
==================================================

Build reusable components.

Examples:

Button
Input
Select
Dropdown
Badge
Modal
Toast
Tooltip
Search
DatePicker
Tabs
Table
Card
EmptyState
LoadingState
Confirmation

Do not duplicate the same UI structure across multiple pages.

If the same interaction appears twice, create a reusable component.

==================================================
10. COMPONENT VARIATION
==================================================

Reusable does NOT mean visually identical everywhere.

For example:

Cards may have:

- different sizes
- different hierarchy
- different content density

while still following the same design system.

Avoid repetitive interfaces.

==================================================
11. NAVIGATION
==================================================

Navigation must clearly communicate:

- current page
- available sections
- role-specific functionality

Admin navigation:

Inventory
Issue
History
People
Insights

User navigation:

My Items
Inventory
History

Do not show irrelevant administrative functionality to normal users.

Navigation should work on desktop and mobile.

==================================================
12. ROLE-BASED UI
==================================================

The interface must adapt according to role.

ADMIN sees:

- administrative controls
- Add Resource
- People
- Insights
- Issue controls
- Edit controls

USER sees:

- My Items
- Inventory
- History

Do not merely hide buttons visually.

The frontend should have a clear permission-aware structure.

==================================================
13. FORMS
==================================================

Forms must be easy to understand.

Every input should have:

- clear label
- useful placeholder where appropriate
- focus state
- validation state
- error state

Do not rely on placeholders as labels.

Group related fields.

Use progressive disclosure where appropriate.

Example:

Returnable?
Yes / No

If Yes:

Return date

Do not show irrelevant fields unnecessarily.

==================================================
14. ISSUE RESOURCE UX
==================================================

The issue workflow is a critical user journey.

It must feel:

- fast
- deliberate
- trustworthy
- easy to verify

Use:

01 Select item
02 Recipient
03 Confirm

Do not overwhelm the administrator with a giant form.

Clearly distinguish:

USER-ENTERED INFORMATION

from:

SYSTEM-GENERATED INFORMATION

The issue date and time must visually appear read-only/system-generated.

==================================================
15. SEARCH & FILTERS
==================================================

Search and filtering must feel responsive.

Inventory filters:

Name
Category
Sub-category
Quantity / Availability

Filters should work together.

Example:

Hardware
+
Electronics
+
In stock
+
Raspberry

Provide:

- active filter indication
- clear filters
- empty results state
- loading state where appropriate

Do not create filters that do nothing.

==================================================
16. TABLES
==================================================

Tables should be lightweight and highly readable.

Do not make them resemble Excel.

Use:

- generous row height
- clear hierarchy
- subtle dividers
- compact metadata
- semantic badges
- clear actions

Avoid:

- heavy borders everywhere
- excessive colors
- unnecessary vertical lines
- tiny text

On mobile, transform tables into readable cards or provide an appropriate responsive alternative.

==================================================
17. STATUS DESIGN
==================================================

Statuses:

Available
Low stock
Issued
Returned
Overdue
Unavailable

Use semantic visual language.

Available:
Mint

Low stock:
Coral

Issued:
Lavender

Overdue:
Warm warning tone

Status must always include text.

Never use color alone.

==================================================
18. DATA VISUALIZATION
==================================================

Insights should be visual but restrained.

Do not create:

- dashboard chart overload
- unnecessary pie charts
- decorative graphs
- fake precision

Every visualization must communicate something useful.

Use whitespace and typography to make analytics understandable.

==================================================
19. EMPTY STATES
==================================================

Never leave blank screens.

Every empty state should explain:

1. What is missing.
2. Why it matters.
3. What the user can do next.

Example:

No resources found.

Try changing your search or filters.

Where appropriate, provide an action.

==================================================
20. LOADING STATES
==================================================

Every data-heavy screen needs a loading state.

Examples:

Dashboard loading
Inventory loading
History loading
Resource details loading
People loading
Insights loading

Prefer skeleton loading where appropriate.

Do not show a blank white screen while data loads.

==================================================
21. ERROR STATES
==================================================

Errors must be understandable.

Bad:

ERROR 500

Better:

Something went wrong.

We couldn't load the inventory. Please try again.

Where appropriate, provide:

Retry

Do not expose technical errors, stack traces or database messages.

==================================================
22. SUCCESS FEEDBACK
==================================================

Important actions must provide feedback.

Examples:

Resource added successfully.
Resource issued successfully.
Resource returned successfully.
Resource updated successfully.

Use:

- toast
- inline confirmation
- dedicated success state

depending on the importance of the action.

Do not use intrusive alerts for minor actions.

==================================================
23. MICROINTERACTIONS
==================================================

Use subtle motion.

Examples:

- button hover
- navigation transition
- dropdown opening
- modal entrance
- filter changes
- row hover
- success transition
- page transition

Animations should generally be quick and purposeful.

Do not use:

- excessive bouncing
- flashy animations
- constant movement
- decorative animations that distract from tasks

Motion should communicate state and hierarchy.

==================================================
24. ACCESSIBILITY
==================================================

Follow accessible UI principles.

Ensure:

- sufficient contrast
- keyboard navigation
- visible focus states
- semantic HTML
- accessible form labels
- meaningful button text
- accessible dropdowns
- status not communicated only through color
- reasonable text sizes

Do not remove focus indicators simply for visual cleanliness.

==================================================
25. RESPONSIVE DESIGN
==================================================

Design responsively from the beginning.

Desktop:

Primary target:
1440px

Tablet:

Adapt layouts naturally.

Mobile:

Do not simply shrink desktop components.

Instead:

- collapse navigation
- convert filters to a drawer/sheet
- stack forms
- convert tables into cards where appropriate
- make primary actions accessible
- preserve visual hierarchy

Mobile must feel intentionally designed.

==================================================
26. PERFORMANCE
==================================================

Keep the frontend lightweight.

Avoid unnecessary:

- dependencies
- animations
- huge assets
- duplicated components
- excessive DOM complexity

Do not sacrifice performance for decorative effects.

==================================================
27. REALISTIC DATA
==================================================

Use realistic DeepTech data.

Resources:

Raspberry Pi 5
Arduino Uno
VS Code Pro License
3D Printer
Toolkit Set
Lab Coat

People:

Students
Teachers
Staff
Researchers
Project Members

Do not use random meaningless names such as:

Item 1
Item 2
Product XYZ

unless specifically necessary.

==================================================
28. NO DEAD INTERACTIONS
==================================================

If an element visually appears interactive, it must behave like it.

Examples:

Search → searches.

Filter → filters.

Clear filters → clears filters.

Issue → opens issue flow.

Resource → opens details.

Add resource → opens add flow.

Return → processes return flow.

Navigation → changes page.

Dropdown → opens options.

Buttons must not exist purely for appearance.

==================================================
29. MOCK DATA BEHAVIOR
==================================================

If a backend is not connected:

Use local/mock data with realistic state transitions.

For example:

When a resource is issued:

available quantity decreases.

The issue appears in history.

The user's assigned items update.

Dashboard numbers update where appropriate.

When a resource is returned:

available quantity increases.

The issue becomes returned.

The user's active items update.

This makes the frontend behave like a real product.

==================================================
30. DATA CONSISTENCY
==================================================

Do not display contradictory information.

Example:

If Raspberry Pi 5 has:

Total = 10
Issued = 3

then:

Available = 7

Do not display:

Available = 8

on another screen.

Use a single source of truth for frontend demo data.

==================================================
31. DATE & TIME DISPLAY
==================================================

Use consistent date/time formatting throughout the application.

Example:

09 Sep 2026 · 05:42 PM

System-generated issue timestamps should appear visually distinct from editable user information.

Do not allow users to edit system-generated timestamps in the UI.

==================================================
32. CONFIRMATION FOR IMPORTANT ACTIONS
==================================================

Use confirmation when an action could have meaningful consequences.

Examples:

Delete resource
Remove access
Cancel important operation

Do not add confirmation dialogs to every small action.

Avoid unnecessary friction.

==================================================
33. INFORMATION HIERARCHY
==================================================

Every screen must have one clear primary purpose.

Ask:

“What is the user here to accomplish?”

Make that action or information visually dominant.

Do not give equal visual weight to everything.

==================================================
34. CONTENT RULES
==================================================

Use concise, human language.

Avoid:

“Click here to proceed with the aforementioned operation.”

Prefer:

“Continue”

Avoid technical jargon where users do not need it.

Use sentence case rather than excessive ALL CAPS.

Use uppercase selectively for small labels or metadata.

==================================================
35. VISUAL HIERARCHY RULE
==================================================

Every screen should have:

PRIMARY
What matters most.

SECONDARY
Supporting information.

TERTIARY
Metadata and low-priority details.

Do not make every piece of information visually loud.

==================================================
36. NO UNNECESSARY DECORATION
==================================================

Every decorative element should have a reason.

Do not add:

- random blobs
- random gradients
- random icons
- random illustrations
- decorative charts
- excessive patterns

Visual personality should come primarily from:

Typography
Composition
Spacing
Color
Interaction
Content hierarchy

==================================================
37. CONSISTENT ICONOGRAPHY
==================================================

Use one coherent icon style.

Icons should:

- support comprehension
- remain secondary to text
- have consistent sizing
- have consistent stroke/visual weight

Do not mix unrelated icon styles.

Do not use icons where text would be clearer.

==================================================
38. IMAGES & VISUAL ASSETS
==================================================

Do not use random stock photos.

For resources, prefer:

- clean product imagery
- subtle generated/abstract representations
- simple icons
- consistent visual placeholders

Resource visuals should feel like part of the DeepTech identity.

==================================================
39. MOBILE TABLE RULE
==================================================

Never force a complex desktop table into a tiny mobile viewport.

For mobile:

Option 1:
Convert rows into resource cards.

Option 2:
Create a carefully designed horizontally scrollable table.

Choose the option that provides the better experience for each screen.

==================================================
40. ROUTING UX
==================================================

Navigation between screens should feel natural.

Examples:

Inventory
→ Resource Details
→ Issue Resource
→ Success

History
→ Issue Record

People
→ Person Details

Dashboard
→ Inventory

Do not create disconnected screens.

==================================================
41. DESIGN SYSTEM FIRST
==================================================

Before creating repeated UI patterns, establish:

- typography scale
- spacing scale
- colors
- radii
- borders
- shadows
- button variants
- input variants
- badge variants
- table patterns
- modal patterns
- navigation states

Then reuse them consistently.

==================================================
42. QUALITY CONTROL
==================================================

Before considering the UI complete, review every screen for:

Visual consistency
Spacing
Typography
Accessibility
Responsiveness
Interaction
Empty states
Loading states
Error states
Success states
Navigation
Content hierarchy

Fix inconsistencies instead of leaving them for later.

==================================================
43. DO NOT OVERENGINEER
==================================================

Do not build unnecessary complexity into the UI.

Do not add features that are not part of the product requirements simply because they look impressive.

Do not create unnecessary pages.

Do not create complicated navigation.

Keep the product focused.

==================================================
44. DO NOT UNDER-DESIGN
==================================================

At the same time, do not create a barebones CRUD interface.

The product needs:

- strong visual identity
- thoughtful layouts
- polished states
- refined typography
- meaningful interactions
- professional spacing
- excellent hierarchy

The goal is:

SIMPLE TO USE
+
DIFFICULT TO MISTAKE FOR A TEMPLATE

==================================================
45. FINAL QUALITY BAR
==================================================

Before finishing, ask:

Does this look like a real startup product?

Does DeepTech have its own visual identity?

Does Grand Hotel + Lato feel intentional?

Does the UI avoid generic SaaS patterns?

Can an admin issue a resource without confusion?

Can a user immediately understand their assigned resources?

Can someone find inventory quickly?

Are important states obvious?

Does the mobile experience feel intentional?

Do interactions actually work?

Does the interface feel polished enough to present publicly?

If the answer to any of these is NO, improve it before considering the implementation complete.

==================================================
FINAL PRINCIPLE
==================================================

Do not optimize for:

“How many components can I put on the screen?”

Optimize for:

“How quickly and confidently can the user accomplish their task?”

DeepTech should feel calm, intelligent, modern and distinctive.

Build less noise.
Create stronger hierarchy.
Use typography deliberately.
Use whitespace confidently.
Make interactions obvious.
Make every screen feel intentional.
