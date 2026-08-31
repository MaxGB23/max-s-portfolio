import * as React from "react"

export function InertiaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="Inertia" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="256" cy="256" r="256" fill="#191922" />
      <path d="M160 330c28-86 110-146 208-152" fill="none" stroke="#9553E9" strokeWidth="42" strokeLinecap="round" />
      <path d="m368 140 56 30-66 38z" fill="#9553E9" />
      <circle cx="160" cy="330" r="26" fill="#9553E9" />
    </svg>
  )
}