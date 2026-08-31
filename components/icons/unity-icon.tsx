import * as React from "react"

export function UnityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="Unity" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="256" cy="256" r="256" fill="#262626" />
      <path d="M256 78 426 328 86 328Z" fill="none" stroke="#FFFFFF" strokeWidth="42" strokeLinejoin="round" />
      <path d="M256 190 344 328 168 328Z" fill="#FFFFFF" />
    </svg>
  )
}