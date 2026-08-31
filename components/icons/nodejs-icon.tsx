import * as React from "react"

export function NodeJsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="Node.js" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M256 84l150 87v170l-150 87-150-87V171z"
        fill="none"
        stroke="#5FA04E"
        strokeWidth="30"
        strokeLinejoin="round"
      />
      <path d="M256 176l96 56v112l-96 56-96-56V232z" fill="#5FA04E" />
    </svg>
  )
}