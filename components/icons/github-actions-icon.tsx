import * as React from "react"

export function GitHubActionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="GitHub Actions" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="24" height="24" rx="5" fill="#111418" />
      <path d="m8.5 14.5-2.4-3.4 2.4-3.6M15.5 14.5l2.4-3.4-2.4-3.6" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14.5h4v4.2h-4z" fill="#FFFFFF" />
      <circle cx="8.5" cy="7.5" r="1.6" fill="#FFFFFF" />
      <circle cx="15.5" cy="7.5" r="1.6" fill="#FFFFFF" />
    </svg>
  )
}