/* ============================================================
   Tailwind CSS Class Builder – app.js
   Pure vanilla JS, no dependencies.
   ============================================================ */

(() => {
  "use strict";

  // ───── Tailwind class definitions with approximate CSS ─────
  const CATEGORIES = [
    {
      name: "Layout",
      classes: [
        { name: "flex",          css: "display: flex;" },
        { name: "inline-flex",   css: "display: inline-flex;" },
        { name: "grid",          css: "display: grid;" },
        { name: "inline-grid",   css: "display: inline-grid;" },
        { name: "block",         css: "display: block;" },
        { name: "inline-block",  css: "display: inline-block;" },
        { name: "inline",        css: "display: inline;" },
        { name: "hidden",        css: "display: none;" },
        { name: "flex-row",      css: "flex-direction: row;" },
        { name: "flex-col",      css: "flex-direction: column;" },
        { name: "flex-wrap",     css: "flex-wrap: wrap;" },
        { name: "flex-nowrap",   css: "flex-wrap: nowrap;" },
        { name: "flex-1",        css: "flex: 1 1 0%;" },
        { name: "flex-auto",     css: "flex: 1 1 auto;" },
        { name: "flex-none",     css: "flex: none;" },
        { name: "grow",          css: "flex-grow: 1;" },
        { name: "grow-0",        css: "flex-grow: 0;" },
        { name: "shrink",        css: "flex-shrink: 1;" },
        { name: "shrink-0",      css: "flex-shrink: 0;" },
        { name: "items-start",   css: "align-items: flex-start;" },
        { name: "items-center",  css: "align-items: center;" },
        { name: "items-end",     css: "align-items: flex-end;" },
        { name: "items-stretch", css: "align-items: stretch;" },
        { name: "justify-start",   css: "justify-content: flex-start;" },
        { name: "justify-center",  css: "justify-content: center;" },
        { name: "justify-end",     css: "justify-content: flex-end;" },
        { name: "justify-between", css: "justify-content: space-between;" },
        { name: "justify-around",  css: "justify-content: space-around;" },
        { name: "justify-evenly",  css: "justify-content: space-evenly;" },
        { name: "relative",     css: "position: relative;" },
        { name: "absolute",     css: "position: absolute;" },
        { name: "fixed",        css: "position: fixed;" },
        { name: "sticky",       css: "position: sticky;" },
        { name: "static",       css: "position: static;" },
        { name: "overflow-hidden",  css: "overflow: hidden;" },
        { name: "overflow-auto",    css: "overflow: auto;" },
        { name: "overflow-scroll",  css: "overflow: scroll;" },
        { name: "overflow-visible", css: "overflow: visible;" },
      ],
    },
    {
      name: "Spacing",
      classes: [
        { name: "p-0",  css: "padding: 0;" },
        { name: "p-1",  css: "padding: 0.25rem;" },
        { name: "p-2",  css: "padding: 0.5rem;" },
        { name: "p-3",  css: "padding: 0.75rem;" },
        { name: "p-4",  css: "padding: 1rem;" },
        { name: "p-5",  css: "padding: 1.25rem;" },
        { name: "p-6",  css: "padding: 1.5rem;" },
        { name: "p-8",  css: "padding: 2rem;" },
        { name: "p-10", css: "padding: 2.5rem;" },
        { name: "p-12", css: "padding: 3rem;" },
        { name: "px-2", css: "padding-left: 0.5rem; padding-right: 0.5rem;" },
        { name: "px-4", css: "padding-left: 1rem; padding-right: 1rem;" },
        { name: "px-6", css: "padding-left: 1.5rem; padding-right: 1.5rem;" },
        { name: "px-8", css: "padding-left: 2rem; padding-right: 2rem;" },
        { name: "py-2", css: "padding-top: 0.5rem; padding-bottom: 0.5rem;" },
        { name: "py-4", css: "padding-top: 1rem; padding-bottom: 1rem;" },
        { name: "py-6", css: "padding-top: 1.5rem; padding-bottom: 1.5rem;" },
        { name: "py-8", css: "padding-top: 2rem; padding-bottom: 2rem;" },
        { name: "m-0",  css: "margin: 0;" },
        { name: "m-1",  css: "margin: 0.25rem;" },
        { name: "m-2",  css: "margin: 0.5rem;" },
        { name: "m-3",  css: "margin: 0.75rem;" },
        { name: "m-4",  css: "margin: 1rem;" },
        { name: "m-5",  css: "margin: 1.25rem;" },
        { name: "m-6",  css: "margin: 1.5rem;" },
        { name: "m-8",  css: "margin: 2rem;" },
        { name: "m-auto", css: "margin: auto;" },
        { name: "mx-auto", css: "margin-left: auto; margin-right: auto;" },
        { name: "mx-2", css: "margin-left: 0.5rem; margin-right: 0.5rem;" },
        { name: "mx-4", css: "margin-left: 1rem; margin-right: 1rem;" },
        { name: "my-2", css: "margin-top: 0.5rem; margin-bottom: 0.5rem;" },
        { name: "my-4", css: "margin-top: 1rem; margin-bottom: 1rem;" },
        { name: "my-6", css: "margin-top: 1.5rem; margin-bottom: 1.5rem;" },
        { name: "mt-1", css: "margin-top: 0.25rem;" },
        { name: "mt-2", css: "margin-top: 0.5rem;" },
        { name: "mt-4", css: "margin-top: 1rem;" },
        { name: "mb-2", css: "margin-bottom: 0.5rem;" },
        { name: "mb-4", css: "margin-bottom: 1rem;" },
        { name: "ml-2", css: "margin-left: 0.5rem;" },
        { name: "mr-2", css: "margin-right: 0.5rem;" },
        { name: "gap-1", css: "gap: 0.25rem;" },
        { name: "gap-2", css: "gap: 0.5rem;" },
        { name: "gap-3", css: "gap: 0.75rem;" },
        { name: "gap-4", css: "gap: 1rem;" },
        { name: "gap-5", css: "gap: 1.25rem;" },
        { name: "gap-6", css: "gap: 1.5rem;" },
        { name: "gap-8", css: "gap: 2rem;" },
      ],
    },
    {
      name: "Sizing",
      classes: [
        { name: "w-auto",   css: "width: auto;" },
        { name: "w-full",   css: "width: 100%;" },
        { name: "w-screen", css: "width: 100vw;" },
        { name: "w-fit",    css: "width: fit-content;" },
        { name: "w-min",    css: "width: min-content;" },
        { name: "w-max",    css: "width: max-content;" },
        { name: "w-1/2",    css: "width: 50%;" },
        { name: "w-1/3",    css: "width: 33.333%;" },
        { name: "w-2/3",    css: "width: 66.667%;" },
        { name: "w-1/4",    css: "width: 25%;" },
        { name: "w-3/4",    css: "width: 75%;" },
        { name: "w-8",      css: "width: 2rem;" },
        { name: "w-12",     css: "width: 3rem;" },
        { name: "w-16",     css: "width: 4rem;" },
        { name: "w-24",     css: "width: 6rem;" },
        { name: "w-32",     css: "width: 8rem;" },
        { name: "w-48",     css: "width: 12rem;" },
        { name: "w-64",     css: "width: 16rem;" },
        { name: "w-96",     css: "width: 24rem;" },
        { name: "h-auto",   css: "height: auto;" },
        { name: "h-full",   css: "height: 100%;" },
        { name: "h-screen", css: "height: 100vh;" },
        { name: "h-fit",    css: "height: fit-content;" },
        { name: "h-8",      css: "height: 2rem;" },
        { name: "h-12",     css: "height: 3rem;" },
        { name: "h-16",     css: "height: 4rem;" },
        { name: "h-24",     css: "height: 6rem;" },
        { name: "h-32",     css: "height: 8rem;" },
        { name: "h-48",     css: "height: 12rem;" },
        { name: "h-64",     css: "height: 16rem;" },
        { name: "max-w-xs",     css: "max-width: 20rem;" },
        { name: "max-w-sm",     css: "max-width: 24rem;" },
        { name: "max-w-md",     css: "max-width: 28rem;" },
        { name: "max-w-lg",     css: "max-width: 32rem;" },
        { name: "max-w-xl",     css: "max-width: 36rem;" },
        { name: "max-w-2xl",    css: "max-width: 42rem;" },
        { name: "max-w-full",   css: "max-width: 100%;" },
        { name: "max-w-screen-sm", css: "max-width: 640px;" },
        { name: "max-w-screen-md", css: "max-width: 768px;" },
        { name: "max-w-screen-lg", css: "max-width: 1024px;" },
        { name: "min-h-0",      css: "min-height: 0;" },
        { name: "min-h-full",   css: "min-height: 100%;" },
        { name: "min-h-screen", css: "min-height: 100vh;" },
        { name: "min-h-fit",    css: "min-height: fit-content;" },
      ],
    },
    {
      name: "Typography",
      classes: [
        { name: "text-xs",    css: "font-size: 0.75rem; line-height: 1rem;" },
        { name: "text-sm",    css: "font-size: 0.875rem; line-height: 1.25rem;" },
        { name: "text-base",  css: "font-size: 1rem; line-height: 1.5rem;" },
        { name: "text-lg",    css: "font-size: 1.125rem; line-height: 1.75rem;" },
        { name: "text-xl",    css: "font-size: 1.25rem; line-height: 1.75rem;" },
        { name: "text-2xl",   css: "font-size: 1.5rem; line-height: 2rem;" },
        { name: "text-3xl",   css: "font-size: 1.875rem; line-height: 2.25rem;" },
        { name: "text-4xl",   css: "font-size: 2.25rem; line-height: 2.5rem;" },
        { name: "text-5xl",   css: "font-size: 3rem; line-height: 1;" },
        { name: "font-thin",       css: "font-weight: 100;" },
        { name: "font-light",      css: "font-weight: 300;" },
        { name: "font-normal",     css: "font-weight: 400;" },
        { name: "font-medium",     css: "font-weight: 500;" },
        { name: "font-semibold",   css: "font-weight: 600;" },
        { name: "font-bold",       css: "font-weight: 700;" },
        { name: "font-extrabold",  css: "font-weight: 800;" },
        { name: "italic",          css: "font-style: italic;" },
        { name: "not-italic",      css: "font-style: normal;" },
        { name: "uppercase",       css: "text-transform: uppercase;" },
        { name: "lowercase",       css: "text-transform: lowercase;" },
        { name: "capitalize",      css: "text-transform: capitalize;" },
        { name: "normal-case",     css: "text-transform: none;" },
        { name: "text-left",    css: "text-align: left;" },
        { name: "text-center",  css: "text-align: center;" },
        { name: "text-right",   css: "text-align: right;" },
        { name: "text-justify", css: "text-align: justify;" },
        { name: "underline",        css: "text-decoration-line: underline;" },
        { name: "line-through",     css: "text-decoration-line: line-through;" },
        { name: "no-underline",     css: "text-decoration-line: none;" },
        { name: "leading-none",    css: "line-height: 1;" },
        { name: "leading-tight",   css: "line-height: 1.25;" },
        { name: "leading-normal",  css: "line-height: 1.5;" },
        { name: "leading-relaxed", css: "line-height: 1.625;" },
        { name: "leading-loose",   css: "line-height: 2;" },
        { name: "tracking-tighter", css: "letter-spacing: -0.05em;" },
        { name: "tracking-tight",   css: "letter-spacing: -0.025em;" },
        { name: "tracking-normal",  css: "letter-spacing: 0;" },
        { name: "tracking-wide",    css: "letter-spacing: 0.025em;" },
        { name: "tracking-wider",   css: "letter-spacing: 0.05em;" },
        { name: "tracking-widest",  css: "letter-spacing: 0.1em;" },
        { name: "truncate",   css: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
        { name: "whitespace-nowrap", css: "white-space: nowrap;" },
        { name: "break-words",       css: "overflow-wrap: break-word;" },
      ],
    },
    {
      name: "Colors",
      classes: [
        { name: "bg-white",       css: "background-color: #fff;" },
        { name: "bg-black",       css: "background-color: #000;" },
        { name: "bg-transparent", css: "background-color: transparent;" },
        { name: "bg-slate-50",    css: "background-color: #f8fafc;" },
        { name: "bg-slate-100",   css: "background-color: #f1f5f9;" },
        { name: "bg-slate-200",   css: "background-color: #e2e8f0;" },
        { name: "bg-slate-500",   css: "background-color: #64748b;" },
        { name: "bg-slate-700",   css: "background-color: #334155;" },
        { name: "bg-slate-900",   css: "background-color: #0f172a;" },
        { name: "bg-red-500",     css: "background-color: #ef4444;" },
        { name: "bg-red-600",     css: "background-color: #dc2626;" },
        { name: "bg-orange-500",  css: "background-color: #f97316;" },
        { name: "bg-amber-500",   css: "background-color: #f59e0b;" },
        { name: "bg-yellow-400",  css: "background-color: #facc15;" },
        { name: "bg-green-500",   css: "background-color: #22c55e;" },
        { name: "bg-green-600",   css: "background-color: #16a34a;" },
        { name: "bg-emerald-500", css: "background-color: #10b981;" },
        { name: "bg-teal-500",    css: "background-color: #14b8a6;" },
        { name: "bg-cyan-500",    css: "background-color: #06b6d4;" },
        { name: "bg-blue-500",    css: "background-color: #3b82f6;" },
        { name: "bg-blue-600",    css: "background-color: #2563eb;" },
        { name: "bg-indigo-500",  css: "background-color: #6366f1;" },
        { name: "bg-violet-500",  css: "background-color: #8b5cf6;" },
        { name: "bg-purple-500",  css: "background-color: #a855f7;" },
        { name: "bg-pink-500",    css: "background-color: #ec4899;" },
        { name: "bg-rose-500",    css: "background-color: #f43f5e;" },
        { name: "text-white",      css: "color: #fff;" },
        { name: "text-black",      css: "color: #000;" },
        { name: "text-slate-300",  css: "color: #cbd5e1;" },
        { name: "text-slate-500",  css: "color: #64748b;" },
        { name: "text-slate-700",  css: "color: #334155;" },
        { name: "text-slate-900",  css: "color: #0f172a;" },
        { name: "text-red-500",    css: "color: #ef4444;" },
        { name: "text-green-500",  css: "color: #22c55e;" },
        { name: "text-blue-500",   css: "color: #3b82f6;" },
        { name: "text-indigo-500", css: "color: #6366f1;" },
        { name: "text-purple-500", css: "color: #a855f7;" },
        { name: "text-pink-500",   css: "color: #ec4899;" },
        { name: "border-white",      css: "border-color: #fff;" },
        { name: "border-black",      css: "border-color: #000;" },
        { name: "border-transparent", css: "border-color: transparent;" },
        { name: "border-slate-200",  css: "border-color: #e2e8f0;" },
        { name: "border-slate-300",  css: "border-color: #cbd5e1;" },
        { name: "border-slate-700",  css: "border-color: #334155;" },
        { name: "border-red-500",    css: "border-color: #ef4444;" },
        { name: "border-blue-500",   css: "border-color: #3b82f6;" },
        { name: "border-green-500",  css: "border-color: #22c55e;" },
      ],
    },
    {
      name: "Borders",
      classes: [
        { name: "border",     css: "border-width: 1px;" },
        { name: "border-0",   css: "border-width: 0;" },
        { name: "border-2",   css: "border-width: 2px;" },
        { name: "border-4",   css: "border-width: 4px;" },
        { name: "border-8",   css: "border-width: 8px;" },
        { name: "border-t",   css: "border-top-width: 1px;" },
        { name: "border-b",   css: "border-bottom-width: 1px;" },
        { name: "border-l",   css: "border-left-width: 1px;" },
        { name: "border-r",   css: "border-right-width: 1px;" },
        { name: "border-solid",  css: "border-style: solid;" },
        { name: "border-dashed", css: "border-style: dashed;" },
        { name: "border-dotted", css: "border-style: dotted;" },
        { name: "border-none",   css: "border-style: none;" },
        { name: "rounded-none", css: "border-radius: 0;" },
        { name: "rounded-sm",   css: "border-radius: 0.125rem;" },
        { name: "rounded",      css: "border-radius: 0.25rem;" },
        { name: "rounded-md",   css: "border-radius: 0.375rem;" },
        { name: "rounded-lg",   css: "border-radius: 0.5rem;" },
        { name: "rounded-xl",   css: "border-radius: 0.75rem;" },
        { name: "rounded-2xl",  css: "border-radius: 1rem;" },
        { name: "rounded-3xl",  css: "border-radius: 1.5rem;" },
        { name: "rounded-full", css: "border-radius: 9999px;" },
        { name: "divide-x",     css: "& > * + * { border-left-width: 1px; }" },
        { name: "divide-y",     css: "& > * + * { border-top-width: 1px; }" },
        { name: "ring-0",   css: "box-shadow: 0 0 0 0px;" },
        { name: "ring-1",   css: "box-shadow: 0 0 0 1px;" },
        { name: "ring-2",   css: "box-shadow: 0 0 0 2px;" },
        { name: "ring-4",   css: "box-shadow: 0 0 0 4px;" },
      ],
    },
    {
      name: "Effects",
      classes: [
        { name: "shadow-sm",  css: "box-shadow: 0 1px 2px 0 rgba(0,0,0,.05);" },
        { name: "shadow",     css: "box-shadow: 0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1);" },
        { name: "shadow-md",  css: "box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);" },
        { name: "shadow-lg",  css: "box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);" },
        { name: "shadow-xl",  css: "box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1);" },
        { name: "shadow-2xl", css: "box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);" },
        { name: "shadow-inner", css: "box-shadow: inset 0 2px 4px 0 rgba(0,0,0,.05);" },
        { name: "shadow-none",  css: "box-shadow: 0 0 #0000;" },
        { name: "opacity-0",    css: "opacity: 0;" },
        { name: "opacity-5",    css: "opacity: 0.05;" },
        { name: "opacity-10",   css: "opacity: 0.1;" },
        { name: "opacity-20",   css: "opacity: 0.2;" },
        { name: "opacity-25",   css: "opacity: 0.25;" },
        { name: "opacity-50",   css: "opacity: 0.5;" },
        { name: "opacity-75",   css: "opacity: 0.75;" },
        { name: "opacity-90",   css: "opacity: 0.9;" },
        { name: "opacity-100",  css: "opacity: 1;" },
        { name: "blur-sm",      css: "filter: blur(4px);" },
        { name: "blur",         css: "filter: blur(8px);" },
        { name: "blur-md",      css: "filter: blur(12px);" },
        { name: "blur-lg",      css: "filter: blur(16px);" },
        { name: "blur-none",    css: "filter: blur(0);" },
        { name: "transition",      css: "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(.4,0,.2,1); transition-duration: 150ms;" },
        { name: "transition-all",  css: "transition-property: all; transition-timing-function: cubic-bezier(.4,0,.2,1); transition-duration: 150ms;" },
        { name: "transition-none", css: "transition-property: none;" },
        { name: "duration-75",   css: "transition-duration: 75ms;" },
        { name: "duration-100",  css: "transition-duration: 100ms;" },
        { name: "duration-150",  css: "transition-duration: 150ms;" },
        { name: "duration-200",  css: "transition-duration: 200ms;" },
        { name: "duration-300",  css: "transition-duration: 300ms;" },
        { name: "duration-500",  css: "transition-duration: 500ms;" },
        { name: "cursor-pointer",  css: "cursor: pointer;" },
        { name: "cursor-default",  css: "cursor: default;" },
        { name: "cursor-not-allowed", css: "cursor: not-allowed;" },
        { name: "select-none",  css: "user-select: none;" },
        { name: "select-text",  css: "user-select: text;" },
        { name: "select-all",   css: "user-select: all;" },
      ],
    },
    {
      name: "Transforms",
      classes: [
        { name: "scale-0",     css: "transform: scale(0);" },
        { name: "scale-50",    css: "transform: scale(.5);" },
        { name: "scale-75",    css: "transform: scale(.75);" },
        { name: "scale-90",    css: "transform: scale(.9);" },
        { name: "scale-95",    css: "transform: scale(.95);" },
        { name: "scale-100",   css: "transform: scale(1);" },
        { name: "scale-105",   css: "transform: scale(1.05);" },
        { name: "scale-110",   css: "transform: scale(1.1);" },
        { name: "scale-125",   css: "transform: scale(1.25);" },
        { name: "scale-150",   css: "transform: scale(1.5);" },
        { name: "rotate-0",    css: "transform: rotate(0deg);" },
        { name: "rotate-1",    css: "transform: rotate(1deg);" },
        { name: "rotate-2",    css: "transform: rotate(2deg);" },
        { name: "rotate-3",    css: "transform: rotate(3deg);" },
        { name: "rotate-6",    css: "transform: rotate(6deg);" },
        { name: "rotate-12",   css: "transform: rotate(12deg);" },
        { name: "rotate-45",   css: "transform: rotate(45deg);" },
        { name: "rotate-90",   css: "transform: rotate(90deg);" },
        { name: "rotate-180",  css: "transform: rotate(180deg);" },
        { name: "-rotate-1",   css: "transform: rotate(-1deg);" },
        { name: "-rotate-2",   css: "transform: rotate(-2deg);" },
        { name: "-rotate-3",   css: "transform: rotate(-3deg);" },
        { name: "-rotate-6",   css: "transform: rotate(-6deg);" },
        { name: "-rotate-12",  css: "transform: rotate(-12deg);" },
        { name: "-rotate-45",  css: "transform: rotate(-45deg);" },
        { name: "-rotate-90",  css: "transform: rotate(-90deg);" },
        { name: "-rotate-180", css: "transform: rotate(-180deg);" },
        { name: "translate-x-0",  css: "transform: translateX(0);" },
        { name: "translate-x-1",  css: "transform: translateX(0.25rem);" },
        { name: "translate-x-2",  css: "transform: translateX(0.5rem);" },
        { name: "translate-x-4",  css: "transform: translateX(1rem);" },
        { name: "translate-x-8",  css: "transform: translateX(2rem);" },
        { name: "translate-x-full", css: "transform: translateX(100%);" },
        { name: "translate-y-0",  css: "transform: translateY(0);" },
        { name: "translate-y-1",  css: "transform: translateY(0.25rem);" },
        { name: "translate-y-2",  css: "transform: translateY(0.5rem);" },
        { name: "translate-y-4",  css: "transform: translateY(1rem);" },
        { name: "translate-y-8",  css: "transform: translateY(2rem);" },
        { name: "translate-y-full", css: "transform: translateY(100%);" },
        { name: "-translate-x-1", css: "transform: translateX(-0.25rem);" },
        { name: "-translate-x-full", css: "transform: translateX(-100%);" },
        { name: "-translate-y-1", css: "transform: translateY(-0.25rem);" },
        { name: "-translate-y-full", css: "transform: translateY(-100%);" },
        { name: "origin-center", css: "transform-origin: center;" },
        { name: "origin-top",    css: "transform-origin: top;" },
        { name: "origin-bottom", css: "transform-origin: bottom;" },
      ],
    },
  ];

  // ───── State ─────
  const activeClasses = new Set();

  // ───── DOM refs ─────
  const $ = (sel) => document.querySelector(sel);
  const categoriesContainer = $("#categories-container");
  const previewBox          = $("#preview-box");
  const activeClassesEl     = $("#active-classes");
  const classStringOutput   = $("#class-string-output");
  const cssOutput           = $("#css-output");
  const classCount          = $("#class-count");
  const searchInput         = $("#search-input");
  const btnCopyClasses      = $("#btn-copy-classes");
  const btnCopyCss          = $("#btn-copy-css");
  const btnClear            = $("#btn-clear");
  const toastContainer      = $("#toast-container");

  // ───── Build category UI ─────
  const chipMap = new Map(); // className -> chip element

  CATEGORIES.forEach((cat, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "category" + (idx === 0 ? " open" : "");

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <span class="category-name">${cat.name}</span>
      <svg class="category-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
    `;
    header.addEventListener("click", () => wrapper.classList.toggle("open"));

    const classesDiv = document.createElement("div");
    classesDiv.className = "category-classes";

    cat.classes.forEach((cls) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = cls.name;
      chip.dataset.cls = cls.name;
      chip.addEventListener("click", () => toggleClass(cls.name));
      classesDiv.appendChild(chip);
      chipMap.set(cls.name, chip);
    });

    wrapper.appendChild(header);
    wrapper.appendChild(classesDiv);
    categoriesContainer.appendChild(wrapper);
  });

  // ───── Core logic ─────
  function toggleClass(name) {
    if (activeClasses.has(name)) {
      activeClasses.delete(name);
    } else {
      activeClasses.add(name);
    }
    render();
  }

  function clearAll() {
    if (activeClasses.size === 0) return;
    activeClasses.clear();
    render();
    toast("Cleared all classes", "success");
  }

  function render() {
    // Update chips
    chipMap.forEach((chip, name) => {
      chip.classList.toggle("active", activeClasses.has(name));
    });

    const arr = [...activeClasses];

    // Count badge
    classCount.textContent = arr.length;

    // Active class tags
    if (arr.length === 0) {
      activeClassesEl.innerHTML = '<p class="empty-state">No classes selected</p>';
    } else {
      activeClassesEl.innerHTML = "";
      arr.forEach((name) => {
        const tag = document.createElement("span");
        tag.className = "active-tag";
        tag.innerHTML = `${name} <span class="remove">&times;</span>`;
        tag.addEventListener("click", () => toggleClass(name));
        activeClassesEl.appendChild(tag);
      });
    }

    // Class string
    const classStr = arr.join(" ");
    classStringOutput.textContent = classStr || "\u2014";

    // CSS output
    if (arr.length === 0) {
      cssOutput.textContent = "\u2014";
    } else {
      const lines = [];
      arr.forEach((name) => {
        const def = findClassDef(name);
        if (def) {
          lines.push("/* ." + name.replace(/\//g, "\\/") + " */");
          def.css.split(";").forEach((rule) => {
            const trimmed = rule.trim();
            if (trimmed) lines.push(trimmed + ";");
          });
          lines.push("");
        }
      });
      cssOutput.textContent = lines.join("\n");
    }

    // Live preview
    updatePreview(arr);
  }

  function findClassDef(name) {
    for (const cat of CATEGORIES) {
      for (const cls of cat.classes) {
        if (cls.name === name) return cls;
      }
    }
    return null;
  }

  function updatePreview(arr) {
    // Reset inline styles
    previewBox.removeAttribute("style");

    arr.forEach((name) => {
      const def = findClassDef(name);
      if (!def) return;
      // Parse each CSS rule and apply inline
      def.css.split(";").forEach((rule) => {
        const trimmed = rule.trim();
        if (!trimmed || trimmed.startsWith("&") || trimmed.startsWith("/*")) return;
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx < 0) return;
        const prop = trimmed.slice(0, colonIdx).trim();
        const val  = trimmed.slice(colonIdx + 1).trim();
        // Convert CSS prop to camelCase
        const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        try {
          previewBox.style[camel] = val;
        } catch (_) { /* ignore unsupported */ }
      });
    });

    // Ensure preview always has some base visual if empty
    if (arr.length === 0) {
      previewBox.style.background = "rgba(109,92,255,.12)";
      previewBox.style.color = "#7f70ff";
      previewBox.style.padding = "1rem 1.5rem";
      previewBox.style.borderRadius = "8px";
      previewBox.style.fontSize = ".85rem";
      previewBox.style.fontWeight = "500";
      previewBox.style.border = "1px dashed #6d5cff";
    }
  }

  // ───── Search ─────
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    CATEGORIES.forEach((cat, idx) => {
      const wrapper = categoriesContainer.children[idx];
      let anyVisible = false;

      cat.classes.forEach((cls) => {
        const chip = chipMap.get(cls.name);
        const match = !query || cls.name.toLowerCase().includes(query);
        chip.classList.toggle("hidden", !match);
        if (match) anyVisible = true;
      });

      // Auto-open categories with matches, collapse if none
      if (query) {
        wrapper.classList.toggle("open", anyVisible);
      }
      wrapper.style.display = anyVisible || !query ? "" : "none";
    });
  });

  // ───── Copy & Clear ─────
  btnCopyClasses.addEventListener("click", () => {
    const str = [...activeClasses].join(" ");
    if (!str) { toast("No classes to copy", "error"); return; }
    copyText(str);
    toast("Class string copied!", "success");
  });

  btnCopyCss.addEventListener("click", () => {
    const text = cssOutput.textContent;
    if (!text || text === "\u2014") { toast("No CSS to copy", "error"); return; }
    copyText(text);
    toast("CSS copied!", "success");
  });

  btnClear.addEventListener("click", clearAll);

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
  }

  // ───── Toast ─────
  function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add("fade-out");
      el.addEventListener("animationend", () => el.remove());
    }, 2200);
  }

  // ───── Initial render ─────
  render();
})();
