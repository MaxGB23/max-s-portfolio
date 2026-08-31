import * as React from "react"

export function VitestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="Vitest" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="256" cy="256" r="256" fill="#FCC72B" />
      <path
        d="M150 172 256 356 362 172"
        fill="none"
        stroke="#161618"
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}