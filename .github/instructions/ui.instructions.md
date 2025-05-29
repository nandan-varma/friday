---
applyTo: '**'
---

try to create components that are reusable and modular. Use props to pass data and methods to child components. Avoid using global state unless necessary.

try to use my UI primitive components for starting point which are present in /components/ui folder for common elements like 
buttons, inputs, calendars and modals. here is the list
accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
avatar.tsx
badge.tsx
breadcrumb.tsx
button.tsx
calendar.tsx
card.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
command.tsx
context-menu.tsx
dialog.tsx
drawer.tsx
dropdown-menu.tsx
form.tsx
hover-card.tsx
input-otp.tsx
input.tsx
label.tsx
menubar.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
progress.tsx
radio-group.tsx
resizable.tsx
scroll-area.tsx
select.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
slider.tsx
sonner.tsx
switch.tsx
table.tsx
tabs.tsx
textarea.tsx
toast.tsx
toaster.tsx
toggle-group.tsx
toggle.tsx
tooltip.tsx
use-mobile.tsx
use-toast.ts
This will help maintain consistency across the application.

Always create skeleton component in the same file of components
use suspense loaders for components that fetch data or take time to render. This improves user experience by providing visual feedback during loading states.
